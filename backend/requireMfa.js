
const requireMfa = (req, res, next) => {

    if (!req.authClaims) {
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    if (req.authClaims.aal !== "aal2") {
        return res.status(403).json({
            code: "MFA_REQUIRED",
            message:
                "Multi-factor authentication required. " +
                "Please verify your authenticator code."
        });
    }

    next();
};

module.exports = requireMfa;
