const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateUser = require("../authMiddleware");


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

        // Validation
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
        console.error(
            "Error creating resource:",
            error.message
        );

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

        console.error(
            "Error fetching resources:",
            error.message
        );

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

        console.error(
            "Error fetching resource:",
            error.message
        );

        res.status(500).json({
            message: "Failed to fetch resource",
            error: error.message
        });
    }
});


// =====================================================
// UPDATE RESOURCE
// PUT /api/resources/:id
// =====================================================

router.put("/:id", authenticateUser, async (req, res) => {
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

        // Check resource ownership
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

        if (
            existingResource.rows[0].user_id !==
            req.user.id
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

        console.error(
            "Error updating resource:",
            error.message
        );

        res.status(500).json({
            message: "Failed to update resource",
            error: error.message
        });
    }
});


// =====================================================
// DELETE RESOURCE
// DELETE /api/resources/:id
// =====================================================

router.delete("/:id", authenticateUser, async (req, res) => {
    try {

        const { id } = req.params;

        // Check ownership
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

        if (
            existingResource.rows[0].user_id !==
            req.user.id
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

        console.error(
            "Error deleting resource:",
            error.message
        );

        res.status(500).json({
            message: "Failed to delete resource",
            error: error.message
        });
    }
});


module.exports = router;