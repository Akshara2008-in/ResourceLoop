const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PUBLISHABLE_KEY
);

const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const token = authHeader.replace("Bearer ", "");

        const {
            data: { user },
            error
        } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }

        // Store authenticated user in request
        req.user = user;

        next();

    } catch (error) {
        console.error(
            "Authentication error:",
            error.message
        );

        res.status(401).json({
            message: "Authentication failed"
        });
    }
};

module.exports = authenticateUser;