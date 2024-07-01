import express, { Router } from "express";
import {
    loginHandler,
    registerHandler,
    verifyOTPHandler,
    refreshTokenHandler,
    logoutHandler,
    forgotPasswordHandler,
    resetPasswordHandler,
} from "../controllers/auth.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router: Router = express.Router();

router.post("/register", registerHandler);
router.post("/login", loginHandler);

router.post("/verify-otp", verifyOTPHandler);
router.post("/refresh", refreshTokenHandler);

router.post("/logout", verifyToken, logoutHandler);

router.post("/forgot", forgotPasswordHandler);
router.post("/reset", resetPasswordHandler);

export default router;
