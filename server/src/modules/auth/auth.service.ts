import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import envConfig from "../../shared/configs/env";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../../shared/errors/app-error";
import { generateToken } from "../../shared/helpers/jwt";
import UserModel, { User, USER_MODEL_HIDDEN_FIELDS } from "../users/user.model";
import { BlockModel } from "../users/block.model";
import { CreateUserInput, LoginUserInput, OTPResetPasswordInput } from "./auth.schema";
import { consumeOTP, issueOTP, verifyOTP } from "./otp.service";

/** Thrown by rotateRefreshToken; `clearCookies` is false when a parallel refresh may have just set fresh cookies */
export class RefreshTokenError extends UnauthorizedError {
    constructor(public readonly clearCookies: boolean) {
        super("Invalid refresh token");
    }
}

type UserId = string | mongoose.Types.ObjectId;

function omitSecrets<T extends { password?: unknown; refreshToken?: unknown }>(user: T) {
    const { password: _password, refreshToken: _refreshToken, ...userInfo } = user;
    return userInfo;
}

async function getBlockedUsers(userId: UserId) {
    const blocks = await BlockModel.find({ blocker: userId }).populate({
        path: "blocked",
        select: USER_MODEL_HIDDEN_FIELDS,
    });
    return blocks.map((b: any) => b.blocked);
}

/** Create a new access/refresh token pair and store the refresh token (only the latest one is valid). */
export async function issueTokens(user: Pick<User, "_id" | "isAdmin">) {
    const accessToken = generateToken(user as User, "access");
    const refreshToken = generateToken(user as User, "refresh");

    await UserModel.findByIdAndUpdate(user._id, { refreshToken });

    return { accessToken, refreshToken };
}

export async function requestRegistration(input: CreateUserInput) {
    const isExists = await UserModel.exists({ $or: [{ email: input.email }, { username: input.username }] });
    if (isExists) throw new BadRequestError("Email or username is already exists");

    await issueOTP({ email: input.email, type: "register", username: input.username, password: input.password });
}

export async function completeRegistration(email: string | undefined, otp: string) {
    const otpData = await consumeOTP(email, "register", otp);

    // The email/username may have been taken while the OTP was pending
    const isExists = await UserModel.exists({ $or: [{ email: otpData.email }, { username: otpData.username }] });
    if (isExists) throw new BadRequestError("Email or username is already exists");

    // otpData.password is already a bcrypt hash; the User pre-save hook won't hash it again
    const newUser = await UserModel.create({
        email: otpData.email,
        username: otpData.username,
        password: otpData.password,
    });

    return omitSecrets(newUser.toObject());
}

export async function login({ email, password }: LoginUserInput) {
    const user = await UserModel.findOne({ email }).select("+password").lean();

    // Same message for unknown email and wrong password, so accounts can't be enumerated
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
        throw new BadRequestError("Invalid credentials");
    }

    const tokens = await issueTokens(user);
    const blockedUsers = await getBlockedUsers(user._id!);

    return { user: { ...omitSecrets(user), blockedUsers }, tokens };
}

export async function logout(userId: UserId) {
    await UserModel.findByIdAndUpdate(userId, { $set: { refreshToken: null } });
}

export async function rotateRefreshToken(refreshToken: string | undefined) {
    if (!refreshToken) throw new RefreshTokenError(false);

    let decoded: { _id: string };
    try {
        decoded = jwt.verify(refreshToken, envConfig.JWT_REFRESH_KEY) as typeof decoded;
    } catch {
        throw new RefreshTokenError(true);
    }

    const user = await UserModel.findById(decoded._id).select("+refreshToken").lean();

    // Only the latest issued refresh token is valid: a token that was rotated out,
    // revoked by logout or by a password reset is rejected
    if (!user || !user.refreshToken || user.refreshToken !== refreshToken) {
        throw new RefreshTokenError(false);
    }

    const tokens = await issueTokens(user);

    return { user: omitSecrets(user), tokens };
}

export async function requestPasswordReset(email: string | undefined) {
    if (!email) throw new BadRequestError("Email is required");

    const isExists = await UserModel.exists({ email });
    if (!isExists) throw new NotFoundError("User not found");

    await issueOTP({ email, type: "forgot" });
}

/** Only checks the OTP; it is consumed by resetPassword */
export async function checkPasswordResetOTP(email: string | undefined, otp: string) {
    await verifyOTP(email, "forgot", otp);
}

export async function resetPassword({ email, otp, password }: OTPResetPasswordInput) {
    // Resetting requires the OTP that was emailed — the email alone is not proof of ownership
    await consumeOTP(email, "forgot", otp);

    const hashedPassword = await bcrypt.hash(password, 10);

    // Also revoke existing sessions
    await UserModel.findOneAndUpdate({ email }, { password: hashedPassword, refreshToken: null });
}

export async function getMe(userId: UserId) {
    const user = await UserModel.findById(userId).select(USER_MODEL_HIDDEN_FIELDS).lean();
    if (!user) return null;

    return { ...user, blockedUsers: await getBlockedUsers(userId) };
}
