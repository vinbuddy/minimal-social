import { NextFunction, Request, Response } from "express";
import UserModel from "../models/user.model";
import {
    CreateUserInput,
    LoginUserInput,
    OTPInput,
    loginSchema,
    otpSchema,
    registerSchema,
} from "../schemas/auth.schema";
import { generateToken } from "../helpers/generateToken";
import bcrypt from "bcrypt";
import { sendEmail } from "../helpers/sendEmail";
import otpGenerator from "otp-generator";
import { OTPModel } from "../models/otp.model";

export async function registerHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const userInput: CreateUserInput = registerSchema.parse(req.body);

        const isExists = await UserModel.findOne({
            $or: [{ email: userInput.email }, { username: userInput.email }],
        });

        if (isExists) {
            return res.status(400).json({ message: "Email or username is already exists" });
        }

        // Check otp is already exists in the database
        const otpExists = await OTPModel.findOne({ email: userInput.email });

        if (otpExists) {
            await OTPModel.findOneAndDelete({ email: userInput.email });
        }

        // Send OTP to the user's email address
        const otp = otpGenerator.generate(6, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        });

        await sendEmail(
            process.env.EMAIL_APP_USER as string,
            userInput.email,
            "OTP for Minimal Social",
            `Your OTP is ${otp}. This OTP will expire in 2 minutes.`
        );

        // Create otp and save it to the database
        const otpModel = new OTPModel({
            username: userInput.email,
            password: userInput.password,
            email: userInput.email,
            otp,
        });

        await otpModel.save();

        return res.status(200).json({ message: "OTP sent to your email address", otp, toEmail: userInput.email });
    } catch (error) {
        next(error);
    }
}

export async function verifyOTPHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const otpInput: OTPInput = otpSchema.parse(req.body);
        const { email, otp } = otpInput;

        const otpData = await OTPModel.findOne({ email });
        if (!otpData) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        const isMatch = await bcrypt.compare(otp, otpData.otp);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        const newUser = new UserModel({ email: otpData.email, username: otpData.email, password: otpData.password });
        await newUser.save();

        return res.status(200).json({ message: "User registered successfully", data: newUser });
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
