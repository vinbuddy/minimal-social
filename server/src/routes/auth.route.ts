import express, { Router } from "express";
import {
    loginHandler,
    registerHandler,
    verifyOTPHandler,
    refreshTokenHandler,
    logoutHandler,
} from "../controllers/auth.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router: Router = express.Router();

router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.post("/verify-otp", verifyOTPHandler);
router.post("/refresh", refreshTokenHandler);
router.post("/logout", verifyToken, logoutHandler);

export default router;
