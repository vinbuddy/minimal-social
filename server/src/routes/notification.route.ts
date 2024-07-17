import express, { Router } from "express";
import { createNotification } from "../controllers/notification.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router: Router = express.Router();

router.post("/", verifyToken, createNotification);
export default router;
