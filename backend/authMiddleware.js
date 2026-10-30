
const { createClient } = require("@supabase/supabase-js");

const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const token = authHeader.substring(7).trim();

        if (!token) {
            return res.status(401).json({
                message: "Access token is missing"
            });
        }

        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_PUBLISHABLE_KEY,
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false
                }
            }
        );

        // Verify the JWT and retrieve its trusted claims.
        const { data, error } =
            await supabase.auth.getClaims(token);

        if (error || !data?.claims?.sub) {
            return res.status(401).json({
                message: "Invalid or expired access token"
            });
        }

        const claims = data.claims;

        // Make authenticated user information available to routes.
        req.authClaims = claims;

        req.user = {
            id: claims.sub,
            email: claims.email,
            app_metadata: claims.app_metadata,
            user_metadata: claims.user_metadata
        };

        next();

    } catch (error) {
        console.error(
            "Authentication error:",
            error.message
        );

        return res.status(401).json({
            message: "Authentication failed"
        });
    }
};

module.exports = authenticateUser;
