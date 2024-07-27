import express, { Router } from "express";
import {
    createNotificationHandler,
    deleteNotificationHandler,
    getUserNotificationsHandler,
    readAllNotificationsHandler,
} from "../controllers/notification.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router: Router = express.Router();

router.post("/", verifyToken, createNotificationHandler);
router.post("/read-all/:userId", verifyToken, readAllNotificationsHandler);
router.get("/:userId", verifyToken, getUserNotificationsHandler);
router.delete("/:id", verifyToken, deleteNotificationHandler);
export default router;
