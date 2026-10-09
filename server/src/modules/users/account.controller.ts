import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

import { OTPInput, otpSchema } from "../auth/auth.schema";

import { RequestWithUser } from "../../shared/types/request";
import UserModel, { USER_MODEL_HIDDEN_FIELDS } from "./user.model";
import { BlockModel } from "./block.model";
import { FollowModel } from "./follow.model";
import { consumeOTP, issueOTP } from "../auth/otp.service";
import { issueTokens } from "../auth/auth.service";
import { setAuthCookies } from "../../shared/configs/cookie";
import { changePasswordSchema } from "./account.schema";

export async function changePasswordHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
        const { password, newPassword } = changePasswordSchema.parse(req.body);

        const user = await UserModel.findById(req.user._id).select("+password");

        if (!user) {
            return res.status(404).json({ statusCode: 404, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ statusCode: 400, message: "Invalid password" });
        }

        // The new password is stored (hashed) with the OTP and applied once the OTP is verified
        await issueOTP({ email: user.email, type: "change", password: newPassword });

        return res.status(200).json({ message: "OTP sent to your email address", toEmail: user.email });
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

        const otpData = await consumeOTP(userExists.email, "change", otp);

        // otpData.password is already a bcrypt hash — store it as is (hashing again would lock the user out)
        await UserModel.findByIdAndUpdate(user._id, { password: otpData.password });

        // Issuing a new refresh token revokes other sessions; this one keeps working with fresh cookies
        const tokens = await issueTokens(userExists);

        return setAuthCookies(res, tokens).status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        next(error);
    }
}

// Block and unblock user
export async function blockUserHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;

        const blockedUserId = req.params.id;
        const userId = req.user?._id?.toString();

        if (blockedUserId === userId) {
            return res.status(400).json({ message: "You cannot block yourself" });
        }

        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const existingBlock = await BlockModel.findOne({ blocker: userId, blocked: blockedUserId });
        if (existingBlock) {
            return res.status(400).json({ message: "User already blocked" });
        }

        await BlockModel.create({ blocker: userId, blocked: blockedUserId });

        // Me: un-follow user blocked
        await FollowModel.deleteOne({ follower: userId, following: blockedUserId });
        // Blocked user: un-follow me
        await FollowModel.deleteOne({ follower: blockedUserId, following: userId });

        return res.status(200).json({ message: "User blocked successfully" });
    } catch (error) {
        next(error);
    }
}

export async function unblockUserHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;

        const blockedUserId = req.params.id;
        const currentUserId = req.user?._id?.toString();

        const currentUser = await UserModel.findById(currentUserId);

        if (!currentUserId) {
            return res.status(404).json({ message: "User not found" });
        }

        const deleteResult = await BlockModel.deleteOne({ blocker: currentUserId, blocked: blockedUserId });
        if (deleteResult.deletedCount === 0) {
            return res.status(400).json({ message: "User not blocked" });
        }

        return res.status(200).json({ message: "User unblocked successfully" });
    } catch (error) {
        next(error);
    }
}

export async function getBlockedUsersHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
        const page = Number(req.query.page) ?? 1;
        const limit = Number(req.query.limit) ?? 15;

        const userId = req.user?._id?.toString();

        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const skip = (Number(page) - 1) * limit;
        const condition = { blocker: new mongoose.Types.ObjectId(userId) };

        const totalUsers = await BlockModel.countDocuments(condition);
        const totalPages = Math.ceil(totalUsers / limit);

        const blocks = await BlockModel.find(condition)
            .skip(skip)
            .limit(limit)
            .populate({
                path: "blocked",
                select: USER_MODEL_HIDDEN_FIELDS
            });

        const blockedUsers = blocks.map(b => b.blocked).filter(u => u);

        return res.status(200).json({
            message: "Get blocked users successfully",
            data: blockedUsers,
            totalPages,
            totalUsers,
            page,
            limit,
        });
    } catch (error) {
        next(error);
    }
}
