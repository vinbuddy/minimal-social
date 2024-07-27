import express, { Router } from "express";
import {
    createNotificationHandler,
    deleteNotificationHandler,
    getUserNotificationsHandler,
} from "../controllers/notification.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router: Router = express.Router();

router.post("/", verifyToken, createNotificationHandler);
router.get("/:userId", verifyToken, getUserNotificationsHandler);
router.delete("/:id", verifyToken, deleteNotificationHandler);
export default router;
