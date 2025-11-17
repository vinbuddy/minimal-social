"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpResetPasswordSchema = exports.otpSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    username: zod_1.z.string({ required_error: "Username is required" }),
    email: zod_1.z.string({ required_error: "Email is required" }).email({ message: "Invalid email" }),
    password: zod_1.z
        .string({ required_error: "Password is required" })
        .min(6, "Password is too short - should be min 6 chars")
        .max(15),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string({ required_error: "Email is required" }).email(),
    password: zod_1.z.string({ required_error: "Password is required" }),
});
exports.otpSchema = zod_1.z.object({
    email: zod_1.z.string({ required_error: "Email is required" }).email().optional(),
    otp: zod_1.z.string({ required_error: "OTP is required" }),
});
exports.otpResetPasswordSchema = zod_1.z.object({
    email: zod_1.z.string({ required_error: "Email is required" }).email(),
    // otp: z.string({ required_error: "OTP is required" }),
    password: zod_1.z
        .string({ required_error: "Password is required" })
        .min(6, "Password is too short - should be min 6 chars")
        .max(15),
});
//# sourceMappingURL=auth.schema.js.map