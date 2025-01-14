import express, { Router } from "express";
import passport from "passport";
import env from "dotenv";
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
} from "../controllers/auth.controller";
import { verifyToken } from "../middlewares/verify-token.middleware";

env.config();

const router: Router = express.Router();

router.post("/register", registerHandler);
router.post("/login", loginHandler);

router.post("/verify-otp", verifyOTPHandler);
router.post("/refresh", refreshTokenHandler);

router.post("/logout", verifyToken, logoutHandler);

router.post("/forgot", forgotPasswordHandler);
router.post("/forgot/verify", verifyForgotPasswordOTPHandler);
router.post("/reset", resetPasswordHandler);

router.get("/me", verifyToken, getMeHandler);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: process.env.CLIENT_BASE_URL, session: true }),
    googleAuthCallbackHandler
);
export default router;
