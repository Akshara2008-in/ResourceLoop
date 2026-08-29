
const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateUser = require("../authMiddleware");


// =====================================================
// CREATE A RESOURCE REQUEST
// =====================================================

router.post("/", authenticateUser, async (req, res) => {
    try {
        const { resource_id, quantity } = req.body;

        const authUserEmail = req.user.email;

        // -------------------------------------------------
        // Find requester profile using authenticated email
        // -------------------------------------------------

        const profileResult = await pool.query(
            `SELECT id
             FROM profiles
             WHERE email = $1
             LIMIT 1`,
            [authUserEmail]
        );

        if (profileResult.rows.length === 0) {
            return res.status(404).json({
                message:
                    "User profile not found. Please make sure your account exists in the profiles table."
            });
        }

        const requester_id = profileResult.rows[0].id;

        // -------------------------------------------------
        // Validate resource ID
        // -------------------------------------------------

        if (!resource_id) {
            return res.status(400).json({
                message: "Resource ID is required"
            });
        }

        // -------------------------------------------------
        // Validate quantity
        // -------------------------------------------------

        const requestedQuantity = Number(quantity);

        if (
            !Number.isInteger(requestedQuantity) ||
            requestedQuantity <= 0
        ) {
            return res.status(400).json({
                message:
                    "Quantity must be a positive integer"
            });
        }

        // -------------------------------------------------
        // Get resource
        // -------------------------------------------------

        const resourceResult = await pool.query(
            `SELECT *
             FROM resources
             WHERE id = $1`,
            [resource_id]
        );

        if (resourceResult.rows.length === 0) {
            return res.status(404).json({
                message: "Resource not found"
            });
        }

        const resource = resourceResult.rows[0];

        // -------------------------------------------------
        // Check availability
        // -------------------------------------------------

        if (Number(resource.quantity) <= 0) {
            return res.status(400).json({
                message:
                    "This resource is currently unavailable"
            });
        }

        if (
            requestedQuantity >
            Number(resource.quantity)
        ) {
            return res.status(400).json({
                message:
                    "Requested quantity is greater than available quantity"
            });
        }

        // -------------------------------------------------
        // Prevent requesting own resource
        // -------------------------------------------------

        if (resource.user_id === requester_id) {
            return res.status(400).json({
                message:
                    "You cannot request your own resource"
            });
        }

        // -------------------------------------------------
        // Create request
        // -------------------------------------------------

        const result = await pool.query(
            `INSERT INTO requests
             (resource_id, requester_id, quantity, status)
             VALUES ($1, $2, $3, 'pending')
             RETURNING *`,
            [
                resource_id,
                requester_id,
                requestedQuantity
            ]
        );

        res.status(201).json({
            message:
                "Resource request created successfully",
            request: result.rows[0],
            requester_profile_id: requester_id
        });

    } catch (error) {
        console.error(
            "Error creating request:",
            error.message
        );

        res.status(500).json({
            message:
                "Failed to create resource request",
            error: error.message
        });
    }
});


// =====================================================
// GET REQUESTS FOR RESOURCES OWNED BY LOGGED-IN USER
// =====================================================

router.get(
    "/owner/:userId",
    authenticateUser,
    async (req, res) => {
        try {
            const userEmail = req.user.email;

            // -------------------------------------------------
            // Find owner's profile
            // -------------------------------------------------

            const profileResult = await pool.query(
                `SELECT id
                 FROM profiles
                 WHERE email = $1
                 LIMIT 1`,
                [userEmail]
            );

            if (profileResult.rows.length === 0) {
                return res.status(404).json({
                    message:
                        "Owner profile not found"
                });
            }

            const profileId =
                profileResult.rows[0].id;

            // -------------------------------------------------
            // Get incoming requests
            // -------------------------------------------------

            const result = await pool.query(
                `SELECT
                    requests.id,
                    requests.resource_id,
                    requests.requester_id,
                    requests.quantity,
                    requests.status,
                    requests.created_at,
                    resources.title AS resource_title,
                    resources.quantity AS available_quantity,
                    resources.location,
                    resources.category
                 FROM requests
                 JOIN resources
                   ON requests.resource_id = resources.id
                 WHERE resources.user_id = $1
                 ORDER BY requests.created_at DESC`,
                [profileId]
            );

            res.json({
                message:
                    "Owner requests retrieved successfully",
                requests: result.rows
            });

        } catch (error) {
            console.error(
                "Error fetching owner requests:",
                error.message
            );

            res.status(500).json({
                message:
                    "Failed to fetch owner requests",
                error:
                    error.message
            });
        }
    }
);


// =====================================================
// GET REQUESTS MADE BY LOGGED-IN USER
// =====================================================

router.get(
    "/user/:userId",
    authenticateUser,
    async (req, res) => {
        try {
            const userEmail = req.user.email;

            // -------------------------------------------------
            // Find user's profile
            // -------------------------------------------------

            const profileResult = await pool.query(
                `SELECT id
                 FROM profiles
                 WHERE email = $1
                 LIMIT 1`,
                [userEmail]
            );

            if (profileResult.rows.length === 0) {
                return res.status(404).json({
                    message:
                        "User profile not found"
                });
            }

            const profileId =
                profileResult.rows[0].id;

            // -------------------------------------------------
            // Get user's requests
            // -------------------------------------------------

            const result = await pool.query(
                `SELECT
                    requests.id,
                    requests.resource_id,
                    requests.requester_id,
                    requests.quantity,
                    requests.status,
                    requests.created_at,
                    resources.title AS resource_title,
                    resources.location,
                    resources.category,
                    resources.condition
                 FROM requests
                 JOIN resources
                   ON requests.resource_id = resources.id
                 WHERE requests.requester_id = $1
                 ORDER BY requests.created_at DESC`,
                [profileId]
            );

            res.json({
                message:
                    "User requests retrieved successfully",
                requests:
                    result.rows
            });

        } catch (error) {
            console.error(
                "Error fetching user requests:",
                error.message
            );

            res.status(500).json({
                message:
                    "Failed to fetch user requests",
                error:
                    error.message
            });
        }
    }
);


// =====================================================
// APPROVE REQUEST
// =====================================================

router.patch(
    "/:requestId/approve",
    authenticateUser,
    async (req, res) => {
        try {
            const { requestId } = req.params;

            // -------------------------------------------------
            // Find owner's profile
            // -------------------------------------------------

            const profileResult = await pool.query(
                `SELECT id
                 FROM profiles
                 WHERE email = $1
                 LIMIT 1`,
                [req.user.email]
            );

            if (profileResult.rows.length === 0) {
                return res.status(404).json({
                    message:
                        "Owner profile not found"
                });
            }

            const ownerId =
                profileResult.rows[0].id;

            // -------------------------------------------------
            // Get request and resource owner
            // -------------------------------------------------

            const requestResult = await pool.query(
                `SELECT
                    requests.id,
                    requests.resource_id,
                    requests.quantity,
                    requests.status,
                    resources.quantity AS available_quantity,
                    resources.user_id AS owner_id
                 FROM requests
                 JOIN resources
                   ON requests.resource_id = resources.id
                 WHERE requests.id = $1`,
                [requestId]
            );

            if (requestResult.rows.length === 0) {
                return res.status(404).json({
                    message:
                        "Request not found"
                });
            }

            const request =
                requestResult.rows[0];

            // -------------------------------------------------
            // Verify ownership
            // -------------------------------------------------

            if (request.owner_id !== ownerId) {
                return res.status(403).json({
                    message:
                        "You are not authorized to approve this request"
                });
            }

            // -------------------------------------------------
            // Check status
            // -------------------------------------------------

            if (request.status !== "pending") {
                return res.status(400).json({
                    message:
                        "This request has already been processed"
                });
            }

            // -------------------------------------------------
            // Check quantity
            // -------------------------------------------------

            if (
                Number(request.quantity) >
                Number(request.available_quantity)
            ) {
                return res.status(400).json({
                    message:
                        "Not enough resources available"
                });
            }

            // -------------------------------------------------
            // Reduce resource quantity
            // -------------------------------------------------

            const resourceUpdate = await pool.query(
                `UPDATE resources
                 SET
                    quantity = quantity - $1,
                    status = CASE
                        WHEN quantity - $1 = 0
                        THEN 'unavailable'
                        ELSE 'available'
                    END
                 WHERE id = $2
                   AND quantity >= $1
                 RETURNING *`,
                [
                    Number(request.quantity),
                    request.resource_id
                ]
            );

            if (resourceUpdate.rows.length === 0) {
                return res.status(400).json({
                    message:
                        "Not enough resources available"
                });
            }

            // -------------------------------------------------
            // Approve request
            // -------------------------------------------------

            const requestUpdate = await pool.query(
                `UPDATE requests
                 SET status = 'approved'
                 WHERE id = $1
                 RETURNING *`,
                [requestId]
            );

            res.json({
                message:
                    "Resource request approved successfully",
                request:
                    requestUpdate.rows[0],
                resource:
                    resourceUpdate.rows[0]
            });

        } catch (error) {
            console.error(
                "Error approving request:",
                error.message
            );

            res.status(500).json({
                message:
                    "Failed to approve request",
                error:
                    error.message
            });
        }
    }
);


// =====================================================
// REJECT REQUEST
// =====================================================

router.patch(
    "/:requestId/reject",
    authenticateUser,
    async (req, res) => {
        try {
            const { requestId } = req.params;

            // -------------------------------------------------
            // Find owner's profile
            // -------------------------------------------------

            const profileResult = await pool.query(
                `SELECT id
                 FROM profiles
                 WHERE email = $1
                 LIMIT 1`,
                [req.user.email]
            );

            if (profileResult.rows.length === 0) {
                return res.status(404).json({
                    message:
                        "Owner profile not found"
                });
            }

            const ownerId =
                profileResult.rows[0].id;

            // -------------------------------------------------
            // Get request + resource owner
            // -------------------------------------------------

            const requestResult = await pool.query(
                `SELECT
                    requests.*,
                    resources.user_id AS owner_id
                 FROM requests
                 JOIN resources
                   ON requests.resource_id = resources.id
                 WHERE requests.id = $1`,
                [requestId]
            );

            if (requestResult.rows.length === 0) {
                return res.status(404).json({
                    message:
                        "Request not found"
                });
            }

            const request =
                requestResult.rows[0];

            // -------------------------------------------------
            // Verify ownership
            // -------------------------------------------------

            if (request.owner_id !== ownerId) {
                return res.status(403).json({
                    message:
                        "You are not authorized to reject this request"
                });
            }

            // -------------------------------------------------
            // Check status
            // -------------------------------------------------

            if (request.status !== "pending") {
                return res.status(400).json({
                    message:
                        "This request has already been processed"
                });
            }

            // -------------------------------------------------
            // Reject request
            // -------------------------------------------------

            const result = await pool.query(
                `UPDATE requests
                 SET status = 'rejected'
                 WHERE id = $1
                 RETURNING *`,
                [requestId]
            );

            res.json({
                message:
                    "Resource request rejected successfully",
                request:
                    result.rows[0]
            });

        } catch (error) {
            console.error(
                "Error rejecting request:",
                error.message
            );

            res.status(500).json({
                message:
                    "Failed to reject request",
                error:
                    error.message
            });
        }
    }
);


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;

