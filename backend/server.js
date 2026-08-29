const express = require("express");
const cors = require("cors");
const pool = require("./db");
const resourceRoutes = require("./routes/resources");
const requestRoutes = require("./routes/requests");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Resource routes
app.use("/api/resources", resourceRoutes);
app.use("/api/requests", requestRoutes);
// Test route
app.get("/", (req, res) => {
    res.json({
        message: "ResourceLoop backend is running!"
    });
});

// Test Supabase database connection
app.get("/api/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "Supabase database connected successfully!",
            time: result.rows[0].now
        });
    } catch (error) {
        console.error("Database connection error:", error.message);

        res.status(500).json({
            message: "Database connection failed",
            error: error.message
        });
    }
});

// Start server
const PORT = 5050;

app.listen(PORT, () => {
    console.log(`ResourceLoop backend running on http://localhost:${PORT}`);
});