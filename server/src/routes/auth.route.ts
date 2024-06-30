import express, { Router } from "express";
import { loginHandler, registerHandler, verifyOTPHandler, refreshTokenHandler } from "../controllers/auth.controller";

const router: Router = express.Router();

router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.post("/verify-otp", verifyOTPHandler);
router.post("/refresh", refreshTokenHandler);

export default router;
