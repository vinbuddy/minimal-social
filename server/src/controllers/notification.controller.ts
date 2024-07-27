import { NextFunction, Request, Response } from "express";
import UserModel, { USER_MODEL_HIDDEN_FIELDS } from "../models/user.model";
import mongoose from "mongoose";
import { CreateNotificationInput, createNotificationSchema } from "../schemas/notification.schema";
import NotificationModel, { NotificationReceiver, Notification } from "../models/notification.model";
import { Server } from "socket.io";
import { getSocketClientsByUserId } from "../helpers/socket";

const helpers = {
    createNotificationReceiver(receiverId: mongoose.Types.ObjectId): NotificationReceiver {
        return { receiver: receiverId, isRead: false };
    },

    senderExists(sendNotification: Notification, senderId: mongoose.Types.ObjectId): boolean {
        return sendNotification.senders.includes(senderId);
    },
    receiverExists(receivers: NotificationReceiver[], receiverId: mongoose.Types.ObjectId): boolean {
        return receivers.some((receiver) => receiver.receiver.toString() === receiverId.toString());
    },

    async updateNotification(
        notification: Notification & mongoose.Document,
        sender: mongoose.Types.ObjectId,
        receivers: mongoose.Types.ObjectId[]
    ) {
        const updateFields: Partial<Notification & mongoose.Document> = {};

        // Check and update sender
        if (!this.senderExists(notification, sender)) {
            updateFields.senders = [...new Set([...notification.senders, sender])];
        }

        const newReceivers = receivers
            .filter((receiverId) => !this.receiverExists(notification.receivers, receiverId))
            .map(this.createNotificationReceiver);

        if (newReceivers.length > 0) {
            updateFields.receivers = [...notification.receivers, ...newReceivers];
        }

        if (Object.keys(updateFields).length > 0) {
            await NotificationModel.updateOne({ _id: notification._id }, { $set: updateFields });
        }

        if (newReceivers.length > 0) {
            await Promise.all(
                newReceivers
                    .filter((r) => r.receiver.toString() !== sender.toString())
                    .map((r) =>
                        UserModel.findOneAndUpdate(
                            { _id: r.receiver },
                            { $set: { isNotification: true } },
                            { new: true }
                        ).exec()
                    )
            );
        }
        const updatedNotification = await NotificationModel.findById(notification._id);
        return updatedNotification;
    },
};

export async function createNotificationHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { targetType, target, action, photo, message, url, sender, receivers } = createNotificationSchema.parse(
            req.body
        ) as CreateNotificationInput;

        const senderId = new mongoose.Types.ObjectId(sender);
        const receiverIds = receivers.map((receiver: string) => new mongoose.Types.ObjectId(receiver));

        // Check exist
        const _notification = await NotificationModel.findOne({
            target: new mongoose.Types.ObjectId(target),
            targetType,
            action,
            url,
        });

        let notification = null;

        if (_notification) {
            notification = await helpers.updateNotification(_notification, senderId, receiverIds);
        } else {
            const notificationReceivers: NotificationReceiver[] = receivers.map((receiver: string) => ({
                receiver: new mongoose.Types.ObjectId(receiver),
                isRead: false,
            }));

            notification = await NotificationModel.create({
                target: target ? new mongoose.Types.ObjectId(target) : null,
                targetType,
                action,
                photo,
                message,
                url: url ?? null,
                sender: [new mongoose.Types.ObjectId(sender)],
                receivers: notificationReceivers,
            });

            // Update user model notification by receiverIds

            for (const receiverId of receiverIds) {
                if (receiverId !== senderId) await UserModel.findByIdAndUpdate(receiverId, { isNotification: true });
            }
        }

        await NotificationModel.populate(notification, [
            { path: "sender", select: USER_MODEL_HIDDEN_FIELDS },
            { path: "receivers.receiver", select: USER_MODEL_HIDDEN_FIELDS },
        ]);

        const senderInfo = await UserModel.findById(sender).select(USER_MODEL_HIDDEN_FIELDS);

        // Send notification to receivers
        const io = req.app.get("io") as Server;

        receivers.forEach((receiver: string) => {
            const socketIds = getSocketClientsByUserId(receiver);

            socketIds.forEach((socketId: string) => {
                if (socketId && receiver !== sender) {
                    io.to(socketId).emit("notification", {
                        notification,
                        sender: senderInfo,
                    });
                }
            });
        });

        return res.status(200).json({
            message: "Create notification successfully",
            data: notification,
        });
    } catch (error) {
        next(error);
    }
}

export async function getUserNotificationsHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.params.userId;
        const page = Number(req.query.page as string) || 1;
        const limit = Number(req.query.limit as string) || 10;
        const action = req.query.action;

        if (!userId) {
            return res.status(400).json({
                message: "User id is required",
            });
        }

        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const condition: any = {
            receivers: {
                $in: [userId],
            },
            action: action,
        };

        const skip = (page - 1) * limit;
        const totalNotifications = await NotificationModel.countDocuments(condition);
        const totalPages = Math.ceil(totalNotifications / limit);

        const notifications = await NotificationModel.find(condition);

        return res.status(200).json({
            message: "Get notifications successfully",
            data: notifications,
            totalPages,
            page,
            limit,
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteNotificationHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const notificationId = req.params.id;

        if (!notificationId) {
            return res.status(400).json({
                message: "Notification id is required",
            });
        }

        const deleted = await NotificationModel.findByIdAndDelete(notificationId);

        if (!deleted) {
            return res.status(404).json({
                message: "Notification not found",
            });
        }

        return res.status(200).json({ message: "Delete notification successfully" });
    } catch (error) {
        next(error);
    }
}
