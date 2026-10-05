const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;

        // Check if Authorization header is missing
        if (!authHeader) {
            return res.status(401).json({
                error: "Unauthorized",
                message: "Authorization header is missing"
            });
        }

        // Validate format: Bearer <token>
        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer" || !parts[1].trim()) {
            return res.status(401).json({
                error: "Unauthorized",
                message: "Malformed Authorization header. Format: Bearer <token>"
            });
        }

        const token = parts[1].trim();

        // Verify token with secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Store decoded user info in req.user
        req.user = decoded;

        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                error: "Unauthorized",
                message: "Token has expired"
            });
        }

        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({
                error: "Unauthorized",
                message: "Invalid token"
            });
        }

        return res.status(401).json({
            error: "Unauthorized",
            message: "Authentication failed"
        });
    }
};

module.exports = authMiddleware;
