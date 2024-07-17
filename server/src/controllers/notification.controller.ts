import { NextFunction, Request, Response } from "express";
import { USER_MODEL_HIDDEN_FIELDS } from "../models/user.model";
import mongoose from "mongoose";
import { CreateNotificationInput, createNotificationSchema } from "../schemas/notification.schema";
import NotificationModel, { NotificationReceiver } from "../models/notification.model";

export async function createNotification(req: Request, res: Response, next: NextFunction) {
    try {
        const { targetType, action, photo, message, url, sender, receivers } = createNotificationSchema.parse(
            req.body
        ) as CreateNotificationInput;

        const notificationReceivers: NotificationReceiver[] = receivers.map((receiver: string) => ({
            receiver: new mongoose.Types.ObjectId(receiver),
            isRead: false,
        }));

        const notification = await NotificationModel.create({
            targetType,
            action,
            photo,
            message,
            url: url ?? null,
            sender: new mongoose.Types.ObjectId(sender),
            receivers: notificationReceivers,
        });

        await NotificationModel.populate(notification, [
            { path: "sender", select: USER_MODEL_HIDDEN_FIELDS },
            { path: "receivers", select: USER_MODEL_HIDDEN_FIELDS },
        ]);

        return res.status(200).json({
            message: "Create notification successfully",
            data: notification,
        });
    } catch (error) {
        next(error);
    }
}
