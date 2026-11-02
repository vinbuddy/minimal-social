import express, { Router } from "express";
import {
    createNotificationHandler,
    deleteNotificationHandler,
    getUserNotificationsHandler,
    readAllNotificationsHandler,
    registerPushTokenHandler,
    removePushTokenHandler,
} from "./notification.controller";
import { verifyToken } from "../../middlewares/verify-token.middleware";

const router: Router = express.Router();

router.post("/", verifyToken, createNotificationHandler);
// Before "/:id": the mobile app's device token for push notifications
router.post("/push-token", verifyToken, registerPushTokenHandler);
router.delete("/push-token", verifyToken, removePushTokenHandler);
router.post("/read-all/:userId", verifyToken, readAllNotificationsHandler);
router.get("/:userId", verifyToken, getUserNotificationsHandler);
router.delete("/:id", verifyToken, deleteNotificationHandler);
export default router;
