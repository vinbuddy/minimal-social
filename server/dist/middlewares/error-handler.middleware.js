"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
function errorHandler(err, req, res, next) {
    if (err instanceof zod_1.ZodError) {
        return res
            .status(400)
            .json({ statusCode: 400, status: "error", message: "Validation error", errors: err.flatten() });
    }
    if (err instanceof Error) {
        const statusCode = (err === null || err === void 0 ? void 0 : err.statusCode) || 500;
        return res.status(statusCode).json({
            statusCode: statusCode,
            status: "error",
            message: err.message, // Return the error message
        });
    }
    return res.status(500).json({
        statusCode: 500,
        status: "error",
        message: "An unexpected error occurred",
    });
}
//# sourceMappingURL=error-handler.middleware.js.map