import { NextFunction, Request, Response } from "express";
import UserModel, { User } from "../models/user.model";
import { CreateUserInput, LoginUserInput, loginSchema, registerSchema } from "../schemas/auth.schema";
import { generateToken } from "../helpers/generateToken";
import bcrypt from "bcrypt";

export async function registerHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const userInput: CreateUserInput = registerSchema.parse(req.body);

        const isExists = await UserModel.findOne({
            $or: [{ email: userInput.email }, { username: userInput.email }],
        });

        if (isExists) {
            return res.status(400).json({ message: "Email or username is already exists" });
        }

        const newUser = new UserModel(userInput);
        await newUser.save();

        return res.status(200).json({ statusCode: 200, message: "User registered successfully" });
    } catch (error) {
        next(error);
    }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password }: LoginUserInput = loginSchema.parse(req.body);

        const user = await UserModel.findOne({ email }); // Find user by email address in the database

        if (!user) {
            return res.status(400).json({ statusCode: 400, message: "User not found" });
        }

        // Compare password with the hashed password in the database using bcrypt

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ statusCode: 400, message: "Invalid credentials" });
        }

        const accessToken = generateToken(user, "access"); // Generate access token for the user
        const refreshToken = generateToken(user, "refresh");

        return res.status(200).json({ statusCode: 200, user, accessToken, refreshToken });
    } catch (error) {
        next(error);
    }
}
