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
import { SessionClient, SessionModel } from "./session.model";
import { findOrCreateGoogleUser, verifyGoogleIdToken } from "./google.service";

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

type RefreshTokenPayload = { _id: string; jti?: string; exp: number };

/** Create a new access/refresh token pair and open a session for it (one per signed-in device). */
export async function issueTokens(user: Pick<User, "_id" | "isAdmin">, client: SessionClient = "web") {
    const accessToken = generateToken(user as User, "access");
    const refreshToken = generateToken(user as User, "refresh");

    const { jti, exp } = jwt.decode(refreshToken) as RefreshTokenPayload;
    await SessionModel.create({ user: user._id, jti, client, expiresAt: new Date(exp * 1000) });

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

export async function login({ email, password }: LoginUserInput, client: SessionClient = "web") {
    const user = await UserModel.findOne({ email }).select("+password").lean();

    // Same message for unknown email and wrong password, so accounts can't be enumerated
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
        throw new BadRequestError("Invalid credentials");
    }

    const tokens = await issueTokens(user, client);
    const blockedUsers = await getBlockedUsers(user._id!);

    return { user: { ...omitSecrets(user), blockedUsers }, tokens };
}

export async function loginWithGoogleIdToken(idToken: string, client: SessionClient) {
    const user = await findOrCreateGoogleUser(await verifyGoogleIdToken(idToken));

    const tokens = await issueTokens(user, client);
    const blockedUsers = await getBlockedUsers(user._id!);

    return { user: { ...omitSecrets(user), blockedUsers }, tokens };
}

/** Signs out only the device that owns `refreshToken`; other devices stay signed in */
export async function logout(userId: UserId, refreshToken: string | undefined) {
    if (!refreshToken) return;

    const decoded = jwt.decode(refreshToken) as RefreshTokenPayload | null;

    if (decoded?.jti) {
        await SessionModel.deleteOne({ user: userId, jti: decoded.jti });
    }

    await UserModel.updateOne({ _id: userId, refreshToken }, { $set: { refreshToken: null } });
}

/** Revokes every session, e.g. after a password reset */
async function revokeAllSessions(userId: UserId) {
    await SessionModel.deleteMany({ user: userId });
    await UserModel.findByIdAndUpdate(userId, { $set: { refreshToken: null } });
}

/** Atomically consumes the session of `refreshToken`, so of two parallel refreshes only one wins */
async function consumeSession(refreshToken: string, decoded: RefreshTokenPayload): Promise<SessionClient | null> {
    if (decoded.jti) {
        const session = await SessionModel.findOneAndDelete({ user: decoded._id, jti: decoded.jti }).lean();
        if (session) return session.client;
    }

    // Refresh tokens issued before sessions existed were stored on the user; accept each once, then it moves to a session
    const legacy = await UserModel.updateOne({ _id: decoded._id, refreshToken }, { $set: { refreshToken: null } });

    return legacy.modifiedCount === 1 ? "web" : null;
}

export async function rotateRefreshToken(refreshToken: string | undefined) {
    if (!refreshToken) throw new RefreshTokenError(false);

    let decoded: RefreshTokenPayload;
    try {
        decoded = jwt.verify(refreshToken, envConfig.JWT_REFRESH_KEY) as RefreshTokenPayload;
    } catch {
        throw new RefreshTokenError(true);
    }

    // A token that was rotated out, revoked by logout or by a password reset has no session
    const client = await consumeSession(refreshToken, decoded);
    if (!client) throw new RefreshTokenError(false);

    const user = await UserModel.findById(decoded._id).lean();
    if (!user) throw new RefreshTokenError(true);

    const tokens = await issueTokens(user, client);

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

    const user = await UserModel.findOneAndUpdate({ email }, { password: hashedPassword }).lean();

    // Also revoke existing sessions
    if (user) await revokeAllSessions(user._id);
}

export async function getMe(userId: UserId) {
    const user = await UserModel.findById(userId).select(USER_MODEL_HIDDEN_FIELDS).lean();
    if (!user) return null;

    return { ...user, blockedUsers: await getBlockedUsers(userId) };
}
