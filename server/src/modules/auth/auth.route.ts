import express, { Router } from "express";
import passport from "passport";
import {
    loginHandler,
    registerHandler,
    verifyOTPHandler,
    refreshTokenHandler,
    logoutHandler,
    forgotPasswordHandler,
    resetPasswordHandler,
    getMeHandler,
    verifyForgotPasswordOTPHandler,
    googleAuthCallbackHandler,
} from "./auth.controller";
import { verifyToken } from "../../middlewares/verify-token.middleware";
import { authLimiter, otpLimiter } from "../../middlewares/rate-limiter.middleware";
import envConfig from "../../shared/configs/env";

const router: Router = express.Router();

router.post("/register", authLimiter, registerHandler);
router.post("/login", authLimiter, loginHandler);

router.post("/verify-otp", otpLimiter, verifyOTPHandler);
router.post("/refresh", refreshTokenHandler);

router.post("/logout", verifyToken, logoutHandler);

router.post("/forgot", otpLimiter, forgotPasswordHandler);
router.post("/forgot/verify", otpLimiter, verifyForgotPasswordOTPHandler);
router.post("/reset", authLimiter, resetPasswordHandler);

router.get("/me", verifyToken, getMeHandler);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: envConfig.CLIENT_BASE_URL, session: true }),
    googleAuthCallbackHandler
);
export default router;
