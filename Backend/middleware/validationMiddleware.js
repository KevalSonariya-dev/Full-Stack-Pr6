/**
 * Reusable Validation Middleware
 * Checks required fields before controller and database execution.
 */

const validateRequired = (fields) => {
    return (req, res, next) => {
        if (!req.body || typeof req.body !== "object") {
            return res.status(400).json({
                error: "Validation Error",
                message: "Request body is required"
            });
        }

        for (const field of fields) {
            const val = req.body[field];
            if (val === undefined || val === null || (typeof val === "string" && val.trim() === "")) {
                const capitalized = field.charAt(0).toUpperCase() + field.slice(1);
                return res.status(400).json({
                    error: "Validation Error",
                    message: `${capitalized} is required`
                });
            }
        }

        next();
    };
};

const validateTask = validateRequired(["title"]);
const validateAuth = validateRequired(["email", "password"]);

module.exports = {
    validateRequired,
    validateTask,
    validateAuth
};
