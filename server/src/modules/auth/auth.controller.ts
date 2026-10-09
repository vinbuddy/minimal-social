import { CookieOptions, NextFunction, Request, Response } from "express";
import logger from "../../shared/configs/logger";
import UserModel, { User, USER_MODEL_HIDDEN_FIELDS } from "../users/user.model";
import { BlockModel } from "../users/block.model";
import {
    CreateUserInput,
    LoginUserInput,
    OTPInput,
    OTPResetPasswordInput,
    loginSchema,
    otpResetPasswordSchema,
    otpSchema,
    registerSchema,
} from "./auth.schema";
import { generateToken } from "../../shared/helpers/jwt";
import bcrypt from "bcrypt";
import { sendEmail } from "../../shared/helpers/email-sender";
import otpGenerator from "otp-generator";
import { OTPModel, OTP_MAX_ATTEMPTS } from "./otp.model";
import jwt from "jsonwebtoken";
import env from "dotenv";

env.config();

/**
 * Check an OTP and count failed attempts. After OTP_MAX_ATTEMPTS wrong guesses the OTP
 * is deleted so it can't be brute-forced; the user must request a new one.
 * Returns the OTP document on success, or an error message on failure.
 */
async function checkOTP(email: string | undefined, type: "register" | "forgot", otp: string) {
    if (!email) return { error: "Invalid or expired OTP" } as const;

    const otpData = await OTPModel.findOne({ email, type });
    if (!otpData) return { error: "Invalid or expired OTP" } as const;

    const isMatch = await bcrypt.compare(otp, otpData.otp);

    if (!isMatch) {
        const updated = await OTPModel.findByIdAndUpdate(otpData._id, { $inc: { attempts: 1 } }, { new: true });

        if (!updated || updated.attempts >= OTP_MAX_ATTEMPTS) {
            await OTPModel.findByIdAndDelete(otpData._id);
            return { error: "Too many failed attempts, please request a new OTP" } as const;
        }

        return { error: "Invalid OTP" } as const;
    }

    return { otpData } as const;
}

function clearAuthCookies(res: Response) {
    return res.clearCookie("accessToken", cookieOptions).clearCookie("refreshToken", cookieOptions);
}

interface RequestWithUser extends Request {
    user: User;
}

const cookieOptions = {
    httpOnly: true,
    secure: process.env.ENVIRONMENT === "production",
    path: "/",
    sameSite: process.env.ENVIRONMENT === "production" ? "none" : "strict",
} as CookieOptions;

export async function registerHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const userInput: CreateUserInput = registerSchema.parse(req.body);

        const isExists = await UserModel.findOne({
            $or: [{ email: userInput.email }, { username: userInput.username }],
        });

        if (isExists) {
            return res.status(400).json({ message: "Email or username is already exists" });
        }

        // Check otp is already exists in the database
        const otpExists = await OTPModel.findOne({ email: userInput.email, type: "register" });

        if (otpExists) {
            await OTPModel.findOneAndDelete({ email: userInput.email, type: "register" });
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
            `Your OTP is ${otp}. This OTP will expire in 5 minutes.`
        );

        // Create otp and save it to the database
        const otpModel = new OTPModel({
            username: userInput.username,
            password: userInput.password, // hashed by the OTP model pre-save hook
            email: userInput.email,
            otp,
            type: "register",
        });

        await otpModel.save();

        return res.status(200).json({ message: "OTP sent to your email address", toEmail: userInput.email });
    } catch (error) {
        next(error);
    }
}

export async function verifyOTPHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const otpInput: OTPInput = otpSchema.parse(req.body);
        const { email, otp } = otpInput;

        const result = await checkOTP(email, "register", otp);
        if ("error" in result) {
            return res.status(400).json({ message: result.error });
        }

        const { otpData } = result;
        await OTPModel.findByIdAndDelete(otpData._id);

        // The email/username may have been taken while the OTP was pending
        const isExists = await UserModel.exists({ $or: [{ email: otpData.email }, { username: otpData.username }] });
        if (isExists) {
            return res.status(400).json({ message: "Email or username is already exists" });
        }

        const newUser = new UserModel({ email: otpData.email, username: otpData.username, password: otpData.password });
        await newUser.save();

        const { password: _password, refreshToken: _refreshToken, ...userInfo } = newUser.toObject();

        return res.status(200).json({ message: "User registered successfully", data: userInfo });
    } catch (error) {
        next(error);
    }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password }: LoginUserInput = loginSchema.parse(req.body);

        const user = await UserModel.findOne({ email }).lean(); // Find user by email address in the database

        if (!user) {
            return res.status(400).json({ statusCode: 400, message: "User not found" });
        }

        // Fetch blocked users manually since it's removed from schema
        const blocks = await BlockModel.find({ blocker: user._id }).populate({
            path: "blocked",
            select: USER_MODEL_HIDDEN_FIELDS,
        });
        (user as any).blockedUsers = blocks.map((b: any) => b.blocked);

        // Compare password with the hashed password in the database using bcrypt

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ statusCode: 400, message: "Invalid credentials" });
        }

        const accessToken = generateToken(user, "access");
        const refreshToken = generateToken(user, "refresh");

        user.refreshToken = refreshToken;
        await UserModel.findByIdAndUpdate(user._id, { refreshToken });

        const { password: _password, refreshToken: _refreshToken, ...userInfo } = user;

        return res
            .cookie("accessToken", accessToken, {
                ...cookieOptions,
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            })
            .cookie("refreshToken", refreshToken, {
                ...cookieOptions,
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            })
            .status(200)
            .json({ statusCode: 200, data: userInfo });
    } catch (error) {
        next(error);
    }
}

export async function logoutHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
        if (!req?.user) {
            return res.status(401).json({ statusCode: 401, message: "You are not authorized" });
        }

        // Update refreshToken to null in the database
        await UserModel.findByIdAndUpdate(
            req.user._id,
            {
                $set: { refreshToken: null },
            },
            { new: true }
        );

        return res
            .clearCookie("accessToken", cookieOptions)
            .clearCookie("refreshToken", cookieOptions)
            .status(200)
            .json({ statusCode: 200, message: "Logged out successfully" });
    } catch (error) {
        next(error);
    }
}

export async function refreshTokenHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ statusCode: 401, message: "Refresh token not found" });
        }

        let decoded: User & { exp: number; iat: number };
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY as string) as typeof decoded;
        } catch {
            return clearAuthCookies(res).status(401).json({ statusCode: 401, message: "Invalid refresh token" });
        }

        const user = await UserModel.findById(decoded._id);

        // Only the latest issued refresh token is valid: a token that was rotated out,
        // revoked by logout or by a password reset is rejected.
        // Cookies are not cleared here: a parallel refresh may have just set fresh ones.
        if (!user || !user.refreshToken || user.refreshToken !== refreshToken) {
            return res.status(401).json({ statusCode: 401, message: "Invalid refresh token" });
        }

        const newAccessToken = generateToken(user, "access");
        const newRefreshToken = generateToken(user, "refresh");

        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

        const { password: _password, refreshToken: _refreshToken, ...userInfo } = user.toObject();

        return res
            .cookie("accessToken", newAccessToken, {
                ...cookieOptions,
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            })
            .cookie("refreshToken", newRefreshToken, {
                ...cookieOptions,
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            })
            .status(200)
            .json({ statusCode: 200, data: userInfo });
    } catch (error) {
        logger.error("Refresh token error:", error);
        next(error);
    }
}

export async function forgotPasswordHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ statusCode: 400, message: "Email is required" });
        }

        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ statusCode: 404, message: "User not found" });
        }

        // Check otp is already exists in the database
        const otpExists = await OTPModel.findOne({ email, type: "forgot" });

        if (otpExists) {
            await OTPModel.findOneAndDelete({ email: email, type: "forgot" });
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
            email,
            "OTP for resetting password",
            `Your OTP is ${otp}. This OTP will expire in 5 minutes.`
        );

        // Create otp and save it to the database
        const otpModel = new OTPModel({
            email: email,
            otp,
            type: "forgot",
        });

        await otpModel.save();

        return res
            .status(200)
            .json({ statusCode: 200, message: "OTP sent to your email address", toEmail: email });
    } catch (error) {
        next(error);
    }
}

export async function verifyForgotPasswordOTPHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const otpInput: OTPInput = otpSchema.parse(req.body);
        const { email, otp } = otpInput;

        // Only checks the OTP; it is consumed by resetPasswordHandler
        const result = await checkOTP(email, "forgot", otp);
        if ("error" in result) {
            return res.status(400).json({ message: result.error });
        }

        return res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        next(error);
    }
}

export async function resetPasswordHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const otpInput: OTPResetPasswordInput = otpResetPasswordSchema.parse(req.body);
        const { email, otp, password } = otpInput;

        // Resetting requires the OTP that was emailed — the email alone is not proof of ownership
        const result = await checkOTP(email, "forgot", otp);
        if ("error" in result) {
            return res.status(400).json({ message: result.error });
        }

        await OTPModel.findByIdAndDelete(result.otpData._id);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Also revoke existing sessions
        await UserModel.findOneAndUpdate({ email }, { password: hashedPassword, refreshToken: null });

        return res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        next(error);
    }
}

export async function getMeHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
        const id = req.user._id;

        if (!id) {
            return res.status(400).json({ statusCode: 400, message: "Id is required" });
        }

        const user = await UserModel.findById(id).select(USER_MODEL_HIDDEN_FIELDS).lean();

        if (user) {
            const blocks = await BlockModel.find({ blocker: id }).populate({
                path: "blocked",
                select: USER_MODEL_HIDDEN_FIELDS,
            });
            (user as any).blockedUsers = blocks.map((b: any) => b.blocked);
        }

        return res.status(200).json({ statusCode: 200, data: user });
    } catch (error) {
        next(error);
    }
}

export async function googleAuthCallbackHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;

        const user = req.user;

        // Generate access token and refresh token
        const accessToken = generateToken(user, "access");
        const refreshToken = generateToken(user, "refresh");

        user.refreshToken = refreshToken;
        await UserModel.findByIdAndUpdate(user._id, { refreshToken });

        const { password: _password, refreshToken: _refreshToken, ...userInfo } = user;

        req.logout((err) => {
            if (err) {
                return next(err);
            }

            return res
                .cookie("accessToken", accessToken, {
                    ...cookieOptions,
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                })
                .cookie("refreshToken", refreshToken, {
                    ...cookieOptions,
                    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                })
                .redirect(`${process.env.CLIENT_BASE_URL as string}/login`);
        });
    } catch (error) {
        logger.error("Google auth callback error:", error);
        next(error);
    }
}
