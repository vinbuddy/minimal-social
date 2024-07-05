import express, { Router } from "express";
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
} from "../controllers/auth.controller";
import { verifyToken } from "../middlewares/verifyToken";

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

export default router;
