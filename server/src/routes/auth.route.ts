import express, { Router } from "express";
import { loginHandler, registerHandler, verifyOTPHandler } from "../controllers/auth.controller";

const router: Router = express.Router();

router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.post("/verify-otp", verifyOTPHandler);

export default router;
