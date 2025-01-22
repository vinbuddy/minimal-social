import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import otpGenerator from "otp-generator";

import { OTPInput, otpSchema } from "../schemas/auth.schema";

import { RequestWithUser } from "../shared/types/request";
import UserModel from "../models/user.model";
import { OTPModel } from "../models/otp.model";
import { sendEmail } from "../shared/helpers/email-sender";
import { changePasswordSchema } from "../schemas/account.schema";

export async function changePasswordHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
        const { password, newPassword } = changePasswordSchema.parse(req.body);

        const user = await UserModel.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ statusCode: 404, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ statusCode: 400, message: "Invalid password" });
        }

        // create otp
        const otpExists = await OTPModel.findOne({ email: user.email, type: "change" });

        if (otpExists) {
            await OTPModel.findOneAndDelete({ email: user.email, type: "change" });
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
            user.email,
            "OTP for changing password",
            `Your OTP is ${otp}. This OTP will expire in 5 minutes.`
        );

        // Create otp and save it to the database
        const otpModel = new OTPModel({
            email: user.email,
            otp,
            type: "change",
            password: newPassword,
        });

        await otpModel.save();

        return res.status(200).json({ message: "OTP sent to your email address", otp, toEmail: user.email });
    } catch (error) {
        next(error);
    }
}

export async function verifyChangePasswordOTPHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
        const user = req.user;

        const otpInput: OTPInput = otpSchema.parse(req.body);
        const { otp } = otpInput;

        const userExists = await UserModel.findById(user._id);

        if (!userExists) {
            return res.status(404).json({ message: "User not found" });
        }

        const otpData = await OTPModel.findOne({ email: userExists.email, type: "change" });

        if (!otpData) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        const isMatch = await bcrypt.compare(otp, otpData.otp);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Update password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(otpData.password, salt);

        await UserModel.findByIdAndUpdate(user._id, { password: hashedPassword });

        return res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        next(error);
    }
}
