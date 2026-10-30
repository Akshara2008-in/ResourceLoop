
const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateUser = require("../authMiddleware");
const requireMfa = require("../requireMfa");


// =====================================================
// CREATE RESOURCE
// POST /api/resources
// =====================================================

router.post("/", authenticateUser, async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            quantity,
            condition,
            location
        } = req.body;

        const user_id = req.user.id;
        const resourceQuantity = Number(quantity);

        if (!title || !category) {
            return res.status(400).json({
                message: "Title and category are required"
            });
        }

        if (
            !Number.isInteger(resourceQuantity) ||
            resourceQuantity <= 0
        ) {
            return res.status(400).json({
                message: "Quantity must be a positive integer"
            });
        }

        const result = await pool.query(
            `INSERT INTO resources
                (
                    user_id,
                    title,
                    description,
                    category,
                    quantity,
                    condition,
                    location,
                    status
                )
             VALUES
                ($1, $2, $3, $4, $5, $6, $7, 'available')
             RETURNING *`,
            [
                user_id,
                title,
                description || null,
                category,
                resourceQuantity,
                condition || null,
                location || null
            ]
        );

        res.status(201).json({
            message: "Resource created successfully",
            resource: result.rows[0]
        });

    } catch (error) {
        console.error("Error creating resource:", error.message);

        res.status(500).json({
            message: "Failed to create resource",
            error: error.message
        });
    }
});


// =====================================================
// GET ALL RESOURCES
// GET /api/resources
// =====================================================

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT *
             FROM resources
             ORDER BY created_at DESC`
        );

        res.json({
            message: "Resources retrieved successfully",
            resources: result.rows
        });

    } catch (error) {
        console.error("Error fetching resources:", error.message);

        res.status(500).json({
            message: "Failed to fetch resources",
            error: error.message
        });
    }
});


// =====================================================
// GET SINGLE RESOURCE
// GET /api/resources/:id
// =====================================================

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT *
             FROM resources
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Resource not found"
            });
        }

        res.json({
            message: "Resource retrieved successfully",
            resource: result.rows[0]
        });

    } catch (error) {
        console.error("Error fetching resource:", error.message);

        res.status(500).json({
            message: "Failed to fetch resource",
            error: error.message
        });
    }
});


// =====================================================
// UPDATE RESOURCE
// PUT /api/resources/:id
// Requires authentication + MFA
// =====================================================

router.put(
    "/:id",
    authenticateUser,
    requireMfa,
    async (req, res) => {
        try {
            const { id } = req.params;

            const {
                title,
                description,
                category,
                quantity,
                condition,
                location
            } = req.body;

            const resourceQuantity = Number(quantity);

            const existingResource = await pool.query(
                `SELECT *
                 FROM resources
                 WHERE id = $1`,
                [id]
            );

            if (existingResource.rows.length === 0) {
                return res.status(404).json({
                    message: "Resource not found"
                });
            }

            // TEMPORARY OWNERSHIP DIAGNOSTICS
            const dbUserId = existingResource.rows[0].user_id;
            const tokenUserId = req.user.id;

            console.log("OWNER CHECK DEBUG (UPDATE):");
            console.log("Database user ID:", JSON.stringify(dbUserId));
            console.log("Database ID type:", typeof dbUserId);
            console.log("Token user ID:", JSON.stringify(tokenUserId));
            console.log("Token ID type:", typeof tokenUserId);
            console.log(
                "IDs match:",
                String(dbUserId).trim() === String(tokenUserId).trim()
            );

            if (
                String(dbUserId).trim() !==
                String(tokenUserId).trim()
            ) {
                return res.status(403).json({
                    message:
                        "You are not authorized to update this resource"
                });
            }

            // Validate quantity
            if (
                !Number.isInteger(resourceQuantity) ||
                resourceQuantity < 0
            ) {
                return res.status(400).json({
                    message:
                        "Quantity must be a non-negative integer"
                });
            }

            const status =
                resourceQuantity === 0
                    ? "unavailable"
                    : "available";

            const result = await pool.query(
                `UPDATE resources
                 SET
                    title = $1,
                    description = $2,
                    category = $3,
                    quantity = $4,
                    condition = $5,
                    location = $6,
                    status = $7
                 WHERE id = $8
                 RETURNING *`,
                [
                    title,
                    description || null,
                    category,
                    resourceQuantity,
                    condition || null,
                    location || null,
                    status,
                    id
                ]
            );

            res.json({
                message: "Resource updated successfully",
                resource: result.rows[0]
            });

        } catch (error) {
            console.error("Error updating resource:", error.message);

            res.status(500).json({
                message: "Failed to update resource",
                error: error.message
            });
        }
    }
);


// =====================================================
// DELETE RESOURCE
// DELETE /api/resources/:id
// Requires authentication + MFA
// =====================================================

router.delete(
    "/:id",
    authenticateUser,
    requireMfa,
    async (req, res) => {
        try {
            const { id } = req.params;

            const existingResource = await pool.query(
                `SELECT *
                 FROM resources
                 WHERE id = $1`,
                [id]
            );

            if (existingResource.rows.length === 0) {
                return res.status(404).json({
                    message: "Resource not found"
                });
            }

            // TEMPORARY OWNERSHIP DIAGNOSTICS
            const dbUserId = existingResource.rows[0].user_id;
            const tokenUserId = req.user.id;

            console.log("OWNER CHECK DEBUG (DELETE):");
            console.log("Database user ID:", JSON.stringify(dbUserId));
            console.log("Database ID type:", typeof dbUserId);
            console.log("Token user ID:", JSON.stringify(tokenUserId));
            console.log("Token ID type:", typeof tokenUserId);
            console.log(
                "IDs match:",
                String(dbUserId).trim() === String(tokenUserId).trim()
            );

            if (
                String(dbUserId).trim() !==
                String(tokenUserId).trim()
            ) {
                return res.status(403).json({
                    message:
                        "You are not authorized to delete this resource"
                });
            }

            const result = await pool.query(
                `DELETE FROM resources
                 WHERE id = $1
                 RETURNING *`,
                [id]
            );

            res.json({
                message: "Resource deleted successfully",
                resource: result.rows[0]
            });

        } catch (error) {
            console.error("Error deleting resource:", error.message);

            res.status(500).json({
                message: "Failed to delete resource",
                error: error.message
            });
        }
    }
);


module.exports = router;
