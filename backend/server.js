
const express = require("express");
const cors = require("cors");
const os = require("os");
const pool = require("./db");

const resourceRoutes = require("./routes/resources");
const requestRoutes = require("./routes/requests");

const app = express();

const PORT = process.env.PORT || 5050;
const INSTANCE_ID = process.env.INSTANCE_ID || os.hostname();

// Middleware
app.use(cors());
app.use(express.json());

// Existing ResourceLoop API routes
app.use("/api/resources", resourceRoutes);
app.use("/api/requests", requestRoutes);

// Root route: identifies the backend instance
app.get("/", (req, res) => {
    res.status(200).json({
        message: "ResourceLoop backend is running!",
        instance: INSTANCE_ID
    });
});

// Health check for Nginx and load-balancing tests
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        instance: INSTANCE_ID
    });
});

// Test Supabase PostgreSQL connection
app.get("/api/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.status(200).json({
            message: "Supabase database connected successfully!",
            time: result.rows[0].now,
            instance: INSTANCE_ID
        });
    } catch (error) {
        console.error(
            "Database connection error:",
            error.message
        );

        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

// Start the server inside the container
app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `ResourceLoop backend ${INSTANCE_ID} listening on port ${PORT}`
    );
});
