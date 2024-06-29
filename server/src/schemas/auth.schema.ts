import { z } from "zod";

export const registerSchema = z.object({
    username: z.string({ required_error: "Username is required" }),
    email: z.string({ required_error: "Email is required" }).email({ message: "Invalid email" }),
    password: z
        .string({ required_error: "Password is required" })
        .min(6, "Password is too short - should be min 6 chars")
        .max(15),
});

export const loginSchema = z.object({
    email: z.string({ required_error: "Email is required" }).email(),
    password: z.string({ required_error: "Password is required" }),
});

export type CreateUserInput = z.infer<typeof registerSchema>;
export type LoginUserInput = z.infer<typeof loginSchema>;
