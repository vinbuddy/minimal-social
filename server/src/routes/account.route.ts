import express, { Router } from "express";
import env from "dotenv";
import { verifyToken } from "../middlewares/verify-token.middleware";
import { changePasswordHandler, verifyChangePasswordOTPHandler } from "../controllers/account.controller";

env.config();

const router: Router = express.Router();

router.post("/change-password", verifyToken, changePasswordHandler);
router.post("/change-password/verify", verifyToken, verifyChangePasswordOTPHandler);

export default router;
