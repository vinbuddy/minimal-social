import { NextFunction, Request, Response } from "express";
import envConfig from "../../shared/configs/env";
import logger from "../../shared/configs/logger";
import { clearAuthCookies, setAuthCookies } from "../../shared/configs/cookie";
import { RequestWithUser } from "../../shared/types/request";
import { User } from "../users/user.model";
import { loginSchema, otpResetPasswordSchema, otpSchema, registerSchema } from "./auth.schema";
import * as authService from "./auth.service";

export async function registerHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const userInput = registerSchema.parse(req.body);

        await authService.requestRegistration(userInput);

        return res.status(200).json({ message: "OTP sent to your email address", toEmail: userInput.email });
    } catch (error) {
        next(error);
    }
}

export async function verifyOTPHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, otp } = otpSchema.parse(req.body);

        const user = await authService.completeRegistration(email, otp);

        return res.status(200).json({ message: "User registered successfully", data: user });
    } catch (error) {
        next(error);
    }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { user, tokens } = await authService.login(loginSchema.parse(req.body));

        return setAuthCookies(res, tokens).status(200).json({ statusCode: 200, data: user });
    } catch (error) {
        next(error);
    }
}

export async function logoutHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;

        await authService.logout(req.user._id);

        return clearAuthCookies(res).status(200).json({ statusCode: 200, message: "Logged out successfully" });
    } catch (error) {
        next(error);
    }
}

export async function refreshTokenHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { user, tokens } = await authService.rotateRefreshToken(req.cookies.refreshToken);

        return setAuthCookies(res, tokens).status(200).json({ statusCode: 200, data: user });
    } catch (error) {
        if (error instanceof authService.RefreshTokenError && error.clearCookies) {
            clearAuthCookies(res);
        }
        next(error);
    }
}

export async function forgotPasswordHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { email } = req.body;

        await authService.requestPasswordReset(email);

        return res.status(200).json({ statusCode: 200, message: "OTP sent to your email address", toEmail: email });
    } catch (error) {
        next(error);
    }
}

export async function verifyForgotPasswordOTPHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, otp } = otpSchema.parse(req.body);

        await authService.checkPasswordResetOTP(email, otp);

        return res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        next(error);
    }
}

export async function resetPasswordHandler(req: Request, res: Response, next: NextFunction) {
    try {
        await authService.resetPassword(otpResetPasswordSchema.parse(req.body));

        return res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        next(error);
    }
}

export async function getMeHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;

        const user = await authService.getMe(req.user._id);

        return res.status(200).json({ statusCode: 200, data: user });
    } catch (error) {
        next(error);
    }
}

export async function googleAuthCallbackHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const tokens = await authService.issueTokens(req.user as User);

        // Passport's session was only needed for the OAuth round-trip; the app uses JWT cookies
        req.logout((err) => {
            if (err) {
                return next(err);
            }

            return setAuthCookies(res, tokens).redirect(`${envConfig.CLIENT_BASE_URL}/login`);
        });
    } catch (error) {
        logger.error("Google auth callback error:", error);
        next(error);
    }
}
