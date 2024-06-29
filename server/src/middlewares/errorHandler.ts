import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
    if (err instanceof ZodError) {
        return res
            .status(400)
            .json({ statusCode: 400, status: "error", message: "Validation error", errors: err.flatten() });
    }

    if (err instanceof Error) {
        const statusCode = (err as any)?.statusCode || 500;
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
