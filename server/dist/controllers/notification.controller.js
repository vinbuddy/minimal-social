"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotificationHandler = createNotificationHandler;
exports.getUserNotificationsHandler = getUserNotificationsHandler;
exports.deleteNotificationHandler = deleteNotificationHandler;
exports.readAllNotificationsHandler = readAllNotificationsHandler;
const user_model_1 = __importStar(require("../models/user.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const notification_schema_1 = require("../schemas/notification.schema");
const notification_model_1 = __importDefault(require("../models/notification.model"));
const socket_service_1 = require("../services/socket.service");
const helpers = {
    createNotificationReceiver(receiverId) {
        return { receiver: receiverId, isRead: false };
    },
    senderExists(sendNotification, senderId) {
        return sendNotification.senders.includes(senderId);
    },
    receiverExists(receivers, receiverId) {
        return receivers.some((receiver) => receiver.receiver.toString() === receiverId.toString());
    },
    updateNotification(notification, sender, receivers) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateFields = {};
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
                yield notification_model_1.default.updateOne({ _id: notification._id }, { $set: updateFields });
            }
            if (newReceivers.length > 0) {
                yield Promise.all(newReceivers
                    .filter((r) => r.receiver.toString() !== sender.toString())
                    .map((r) => user_model_1.default.findOneAndUpdate({ _id: r.receiver }, { $set: { isNotification: true } }, { new: true }).exec()));
            }
            const updatedNotification = yield notification_model_1.default.findById(notification._id);
            return updatedNotification;
        });
    },
};
function createNotificationHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { targetType, target, action, photo, message, url, sender, receivers } = notification_schema_1.createNotificationSchema.parse(req.body);
            console.log("sender: ", sender);
            const senderId = new mongoose_1.default.Types.ObjectId(sender);
            const receiverIds = receivers.map((receiver) => new mongoose_1.default.Types.ObjectId(receiver));
            // Check exist
            const _notification = yield notification_model_1.default.findOne({
                target: new mongoose_1.default.Types.ObjectId(target),
                targetType,
                action,
                url,
            });
            let notification = null;
            if (_notification) {
                notification = yield helpers.updateNotification(_notification, senderId, receiverIds);
            }
            else {
                const notificationReceivers = receivers.map((receiver) => ({
                    receiver: new mongoose_1.default.Types.ObjectId(receiver),
                    isRead: false,
                }));
                notification = yield notification_model_1.default.create({
                    target: target ? new mongoose_1.default.Types.ObjectId(target) : null,
                    targetType,
                    action,
                    photo,
                    message,
                    url: url !== null && url !== void 0 ? url : null,
                    senders: [senderId],
                    receivers: notificationReceivers,
                });
                // Update user model notification by receiverIds
                for (const receiverId of receiverIds) {
                    if (receiverId !== senderId)
                        yield user_model_1.default.findByIdAndUpdate(receiverId, { isNotification: true });
                }
            }
            yield notification_model_1.default.populate(notification, [
                { path: "sender", select: user_model_1.USER_MODEL_HIDDEN_FIELDS },
                { path: "receivers.receiver", select: user_model_1.USER_MODEL_HIDDEN_FIELDS },
            ]);
            const senderInfo = yield user_model_1.default.findById(sender).select(user_model_1.USER_MODEL_HIDDEN_FIELDS);
            // Send notification to receivers
            const io = req.app.get("io");
            receivers.forEach((receiver) => {
                const socketIds = (0, socket_service_1.getSocketClientsByUserId)(receiver);
                socketIds.forEach((socketId) => {
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
        }
        catch (error) {
            next(error);
        }
    });
}
function getUserNotificationsHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.params.userId;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const action = req.query.action;
            if (!userId) {
                return res.status(400).json({
                    message: "User id is required",
                });
            }
            const user = yield user_model_1.default.findById(userId);
            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                });
            }
            const condition = {
                receivers: {
                    $elemMatch: { receiver: new mongoose_1.default.Types.ObjectId(userId) },
                },
            };
            if (action && action !== "all") {
                condition["action"] = action;
            }
            const skip = (page - 1) * limit;
            const totalNotifications = yield notification_model_1.default.countDocuments(condition);
            const totalPages = Math.ceil(totalNotifications / limit);
            const result = yield notification_model_1.default.find(condition).sort({ createdAt: -1 }).skip(skip).limit(limit);
            const notifications = yield notification_model_1.default.populate(result, [
                { path: "senders", select: user_model_1.USER_MODEL_HIDDEN_FIELDS },
                { path: "receivers.receiver", select: user_model_1.USER_MODEL_HIDDEN_FIELDS },
            ]);
            return res.status(200).json({
                message: "Get notifications successfully",
                data: notifications,
                totalPages,
                page,
                limit,
            });
        }
        catch (error) {
            next(error);
        }
    });
}
function deleteNotificationHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const notificationId = req.params.id;
            if (!notificationId) {
                return res.status(400).json({
                    message: "Notification id is required",
                });
            }
            const deleted = yield notification_model_1.default.findByIdAndDelete(notificationId);
            if (!deleted) {
                return res.status(404).json({
                    message: "Notification not found",
                });
            }
            return res.status(200).json({ message: "Delete notification successfully" });
        }
        catch (error) {
            next(error);
        }
    });
}
function readAllNotificationsHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.params.userId;
            if (!userId) {
                return res.status(400).json({
                    message: "User id is required",
                });
            }
            const updated = yield user_model_1.default.findByIdAndUpdate(userId, { isNotification: false });
            if (!updated) {
                return res.status(404).json({
                    message: "User not found",
                });
            }
            return res.status(200).json({ message: "Read all notifications successfully" });
        }
        catch (error) {
            next(error);
        }
    });
}
//# sourceMappingURL=notification.controller.js.map