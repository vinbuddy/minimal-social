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
exports.createMessageHandler = createMessageHandler;
exports.getConversationMessagesHandler = getConversationMessagesHandler;
exports.getMessagesWithCursorHandler = getMessagesWithCursorHandler;
exports.reactMessageHandler = reactMessageHandler;
exports.unreactMessageHandler = unreactMessageHandler;
exports.getUsersReactedMessageHandler = getUsersReactedMessageHandler;
exports.deleteMessageHandler = deleteMessageHandler;
exports.retractMessageHandler = retractMessageHandler;
exports.markMessageAsSeenHandler = markMessageAsSeenHandler;
exports.searchMessagesHandler = searchMessagesHandler;
const user_model_1 = __importStar(require("../models/user.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const message_schema_1 = require("../schemas/message.schema");
const conversation_model_1 = __importDefault(require("../models/conversation.model"));
const cloudinary_1 = require("../shared/helpers/cloudinary");
const message_model_1 = __importDefault(require("../models/message.model"));
var E_EMOJI;
(function (E_EMOJI) {
    E_EMOJI["HEART"] = "\u2764\uFE0F";
    E_EMOJI["HAHA"] = "\uD83D\uDE06";
    E_EMOJI["WOW"] = "\uD83D\uDE2E";
    E_EMOJI["SAD"] = "\uD83D\uDE22";
    E_EMOJI["ANGRY"] = "\uD83D\uDE21";
})(E_EMOJI || (E_EMOJI = {}));
function createMessageHandler(_req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const req = _req;
            const { senderId, conversationId, content, replyTo, stickerUrl, gifUrl } = message_schema_1.createMessageSchema.parse(req.body);
            const files = req.files;
            let conversation = yield conversation_model_1.default.findOne({
                _id: new mongoose_1.default.Types.ObjectId(conversationId),
            });
            if (!conversation || !conversationId) {
                return res.status(404).json({ message: "Conversation not found" });
            }
            // Create the message
            let uploadedFiles = [];
            if (files && files.length > 0) {
                const uploadPromises = files.map((file) => {
                    let uploadPromise = (0, cloudinary_1.uploadToCloudinary)(file, "messages");
                    return uploadPromise;
                });
                uploadedFiles = yield Promise.all(uploadPromises);
            }
            const newMessage = yield message_model_1.default.create({
                sender: new mongoose_1.default.Types.ObjectId(senderId),
                conversation: conversation._id,
                content: content !== null && content !== void 0 ? content : null,
                replyTo: replyTo ? new mongoose_1.default.Types.ObjectId(replyTo) : null,
                mediaFiles: uploadedFiles || [],
                stickerUrl: stickerUrl !== null && stickerUrl !== void 0 ? stickerUrl : null,
                gifUrl: gifUrl !== null && gifUrl !== void 0 ? gifUrl : null,
                seenBy: [new mongoose_1.default.Types.ObjectId(senderId)],
            });
            const message = yield message_model_1.default.populate(newMessage, [
                { path: "sender", select: user_model_1.USER_MODEL_HIDDEN_FIELDS },
                {
                    path: "conversation",
                    populate: {
                        path: "participants",
                        select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
                    },
                },
                {
                    path: "replyTo",
                },
                {
                    path: "seenBy",
                    select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
                },
            ]);
            let lastMessageContent = "Sent message";
            if (message.content) {
                lastMessageContent = message.content;
            }
            else if (stickerUrl) {
                lastMessageContent = "Sent sticker";
            }
            else if (gifUrl) {
                lastMessageContent = "Sent gif";
            }
            else if (uploadedFiles.length > 0) {
                lastMessageContent = "Sent photo";
            }
            const lastMessage = {
                sender: message.sender._id,
                content: lastMessageContent,
                createdAt: message._id.getTimestamp(),
            };
            conversation.lastMessage = lastMessage;
            conversation.hiddenBy = [];
            yield conversation.save();
            // Send real time message in room
            const io = req.app.get("io");
            io.to(conversationId).emit("newMessage", message);
            return res.status(200).json({ message: "Create message successfully", data: message });
        }
        catch (error) {
            next(error);
        }
    });
}
function getConversationMessagesHandler(_req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const req = _req;
            const { conversationId, page, limit } = message_schema_1.getMessagesQuerySchema.parse(req.query);
            const userId = (_a = req.user._id) === null || _a === void 0 ? void 0 : _a.toString();
            const conversation = yield conversation_model_1.default.findById(conversationId);
            if (!conversation) {
                return res.status(404).json({ message: "Conversation not found" });
            }
            const isMember = conversation.participants.some((participant) => participant._id.toString() === userId);
            if (!isMember) {
                return res.status(403).json({ message: "You are not a member of this conversation" });
            }
            const condition = {
                conversation: new mongoose_1.default.Types.ObjectId(conversationId),
                excludedFor: { $nin: new mongoose_1.default.Types.ObjectId(userId) },
            };
            const skip = (Number(page) - 1) * limit;
            const totalMessages = yield message_model_1.default.countDocuments(condition);
            const totalPages = Math.ceil(totalMessages / limit);
            const messages = yield message_model_1.default.find(condition)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .populate({
                path: "sender",
                select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
            })
                .populate({
                path: "seenBy",
                select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
            })
                .populate({
                path: "replyTo",
            })
                .populate({
                path: "conversation",
            })
                .populate({
                path: "reactions.user",
            });
            return res
                .status(200)
                .json({ message: "Get messages successfully", data: messages, totalMessages, totalPages, page, limit });
        }
        catch (error) {
            next(error);
        }
    });
}
// Cursor-based pagination
function getMessagesWithCursorHandler(_req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const req = _req;
            const { conversationId, direction, messageId, limit } = message_schema_1.getMessagesWithCursorQuerySchema.parse(req.query);
            const userId = (_a = req.user._id) === null || _a === void 0 ? void 0 : _a.toString();
            const conversation = yield conversation_model_1.default.findById(conversationId);
            if (!conversation) {
                return res.status(404).json({ message: "Conversation not found" });
            }
            const isMember = conversation.participants.some((participant) => participant._id.toString() === userId);
            if (!isMember) {
                return res.status(403).json({ message: "You are not a member of this conversation" });
            }
            let messages = [];
            let hasNextPage = false;
            let hasPrevPage = false;
            if (direction === "init") {
                const messages = yield message_model_1.default.find({
                    conversation: new mongoose_1.default.Types.ObjectId(conversationId),
                    excludedFor: { $nin: new mongoose_1.default.Types.ObjectId(userId) },
                })
                    .limit(limit)
                    .sort({ createdAt: -1 })
                    .populate({
                    path: "seenBy",
                    select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
                })
                    .populate({ path: "sender", select: user_model_1.USER_MODEL_HIDDEN_FIELDS })
                    .populate({ path: "replyTo" })
                    .populate({
                    path: "conversation",
                    populate: {
                        path: "participants",
                        select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
                        populate: {
                            path: "blockedUsers",
                            select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
                        },
                    },
                })
                    .populate({ path: "reactions.user", select: user_model_1.USER_MODEL_HIDDEN_FIELDS });
                // Check hasPrevPage
                if (messages.length === limit) {
                    const lastMessage = messages[messages.length - 1];
                    const prevMessages = yield message_model_1.default.find({
                        conversation: new mongoose_1.default.Types.ObjectId(conversationId),
                        createdAt: { $lt: lastMessage.createdAt },
                    }).limit(1);
                    hasPrevPage = prevMessages.length > 0;
                }
                return res
                    .status(200)
                    .json({ message: "Get messages successfully", data: messages, hasNextPage, hasPrevPage });
            }
            const message = yield message_model_1.default.findById(messageId)
                .populate({
                path: "sender",
                select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
            })
                .populate({
                path: "seenBy",
                select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
            })
                .populate({
                path: "replyTo",
            })
                .populate({
                path: "conversation",
                populate: {
                    path: "participants",
                    select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
                    populate: {
                        path: "blockedUsers",
                        select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
                    },
                },
            })
                .populate({
                path: "reactions.user",
                select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
            });
            const condition = {
                conversation: new mongoose_1.default.Types.ObjectId(conversationId),
                excludedFor: { $nin: new mongoose_1.default.Types.ObjectId(userId) },
            };
            if (direction === "next" && (message === null || message === void 0 ? void 0 : message.createdAt)) {
                condition.createdAt = { $gt: new Date(message.createdAt) };
            }
            if (direction === "prev" && (message === null || message === void 0 ? void 0 : message.createdAt)) {
                condition.createdAt = { $lt: new Date(message.createdAt) };
            }
            // if both -> get message around (4 prev) and (4 next) of cursor;
            if (direction === "both" && (message === null || message === void 0 ? void 0 : message.createdAt)) {
                const prevMessages = yield message_model_1.default.find(Object.assign(Object.assign({}, condition), { createdAt: { $lt: new Date(message.createdAt) } }))
                    .limit(5)
                    .sort({ createdAt: -1 })
                    .populate({
                    path: "sender",
                    select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
                })
                    .populate({
                    path: "seenBy",
                    select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
                })
                    .populate({
                    path: "replyTo",
                })
                    .populate({
                    path: "conversation",
                    populate: {
                        path: "participants",
                        select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
                        populate: {
                            path: "blockedUsers",
                            select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
                        },
                    },
                })
                    .populate({
                    path: "reactions.user",
                    select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
                })
                    .lean();
                const nextMessages = yield message_model_1.default.find(Object.assign(Object.assign({}, condition), { createdAt: { $gt: new Date(message.createdAt) } }))
                    .limit(5)
                    .sort({ createdAt: 1 })
                    .populate({
                    path: "sender",
                    select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
                })
                    .populate({
                    path: "seenBy",
                    select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
                })
                    .populate({
                    path: "replyTo",
                })
                    .populate({
                    path: "conversation",
                    populate: {
                        path: "participants",
                        select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
                        populate: {
                            path: "blockedUsers",
                            select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
                        },
                    },
                })
                    .populate({
                    path: "reactions.user",
                    select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
                })
                    .lean();
                messages = [...nextMessages, message, ...prevMessages].sort((a, b) => {
                    if (!a.createdAt || !b.createdAt)
                        return 0;
                    return b.createdAt.getTime() - a.createdAt.getTime();
                });
            }
            if (direction === "next" || direction === "prev") {
                messages = yield message_model_1.default.find(condition)
                    .limit(limit)
                    .sort({ createdAt: direction == "next" ? 1 : -1 })
                    .populate({
                    path: "seenBy",
                    select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
                })
                    .populate({ path: "sender", select: user_model_1.USER_MODEL_HIDDEN_FIELDS })
                    .populate({ path: "replyTo" })
                    .populate({
                    path: "conversation",
                    populate: {
                        path: "participants",
                        select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
                        populate: {
                            path: "blockedUsers",
                            select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
                        },
                    },
                })
                    .populate({ path: "reactions.user", select: user_model_1.USER_MODEL_HIDDEN_FIELDS });
                const _message = direction === "prev" ? messages[messages.length - 1] : messages[0];
                const _messages = yield message_model_1.default.find({
                    conversation: new mongoose_1.default.Types.ObjectId(conversationId),
                    createdAt: direction === "prev" ? { $lt: _message.createdAt } : { $gt: _message.createdAt },
                }).limit(1);
                hasNextPage = direction === "next" ? _messages.length > 0 : false;
                hasPrevPage = direction === "prev" ? _messages.length > 0 : false;
            }
            return res.status(200).json({ message: "Get messages successfully", data: messages, hasNextPage, hasPrevPage });
        }
        catch (error) {
            console.log("error: ", error);
            next(error);
        }
    });
}
function reactMessageHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId, emoji, conversationId } = req.body;
            const messageId = req.params.id;
            const message = yield message_model_1.default.findById(messageId);
            if (!message) {
                return res.status(404).json({ message: "Message not found" });
            }
            const reactionIndex = message.reactions.findIndex((reaction) => reaction.user.toString() === userId);
            if (reactionIndex === -1) {
                message.reactions.push({ user: new mongoose_1.default.Types.ObjectId(userId), emoji });
                yield message.save();
            }
            else {
                yield message_model_1.default.updateOne({
                    _id: message._id,
                    "reactions.user": new mongoose_1.default.Types.ObjectId(userId),
                }, {
                    $set: {
                        "reactions.$.emoji": emoji,
                    },
                });
            }
            const updatedMessage = yield message_model_1.default.findById(message._id)
                .populate({
                path: "sender",
                select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
            })
                .populate({
                path: "replyTo",
            })
                .populate({
                path: "conversation",
            })
                .populate({
                path: "reactions.user",
            });
            const io = req.app.get("io");
            io.to(conversationId).emit("reactMessage", updatedMessage);
            return res.status(200).json({ message: "React message successfully", data: updatedMessage });
        }
        catch (error) {
            next(error);
        }
    });
}
function unreactMessageHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId, conversationId } = req.body;
            const messageId = req.params.id;
            const message = yield message_model_1.default.findById(messageId);
            if (!message) {
                return res.status(404).json({ message: "Message not found" });
            }
            const reactionIndex = message.reactions.findIndex((reaction) => reaction.user.toString() === userId);
            if (reactionIndex !== -1) {
                message.reactions.splice(reactionIndex, 1);
                yield message.save();
            }
            const updatedMessage = yield message_model_1.default.findOne({ _id: new mongoose_1.default.Types.ObjectId(messageId) })
                .populate({ path: "sender", select: user_model_1.USER_MODEL_HIDDEN_FIELDS })
                .populate({ path: "replyTo" })
                .populate({ path: "conversation" })
                .populate({ path: "reactions.user", select: user_model_1.USER_MODEL_HIDDEN_FIELDS });
            const io = req.app.get("io");
            io.to(conversationId).emit("unreactMessage", updatedMessage);
            return res.status(200).json({ message: "Unreact message successfully", data: updatedMessage });
        }
        catch (error) {
            next(error);
        }
    });
}
function getEmojiFromClientInput(clientInput) {
    const uppercasedInput = clientInput.toUpperCase();
    if (uppercasedInput in E_EMOJI) {
        return E_EMOJI[uppercasedInput];
    }
    throw new Error(`Emoji with key "${clientInput}" not found`);
}
function getUsersReactedMessageHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { emoji, messageId } = message_schema_1.getUsersReactedMessageQuerySchema.parse(req.query);
            let emojiIcon;
            try {
                emojiIcon = getEmojiFromClientInput(emoji); // Ex: convert 'heart' to '❤️'
            }
            catch (error) {
                return res.status(400).json({ message: "Invalid emoji" });
            }
            const message = yield message_model_1.default.findOne({
                _id: new mongoose_1.default.Types.ObjectId(messageId),
                reactions: { $elemMatch: { emoji: emojiIcon } },
            }).lean();
            if (!message) {
                return res.status(200).json({ message: "This message has not reacted yet", data: [] });
            }
            const filteredReactions = message.reactions.filter((reaction) => reaction.emoji === emojiIcon);
            const populatedReactions = yield Promise.all(filteredReactions.map((reaction) => __awaiter(this, void 0, void 0, function* () {
                if (reaction.user) {
                    const populatedUser = yield user_model_1.default.findById(reaction.user)
                        .select(user_model_1.USER_MODEL_HIDDEN_FIELDS)
                        .lean();
                    return Object.assign(Object.assign({}, reaction), { user: populatedUser });
                }
                return reaction;
            })));
            const populatedMessage = Object.assign(Object.assign({}, message), { reactions: populatedReactions });
            return res.status(200).json({ message: "Get users reacted message successfully", data: populatedMessage });
        }
        catch (error) {
            next(error);
        }
    });
}
function deleteMessageHandler(_req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const req = _req;
            const messageId = req.params.id;
            const userId = (_a = req.user._id) === null || _a === void 0 ? void 0 : _a.toString();
            const message = yield message_model_1.default.findById(messageId);
            if (!message) {
                return res.status(404).json({ message: "Message not found" });
            }
            if (message.sender.toString() !== userId) {
                return res.status(403).json({ message: "You are not the sender of this message" });
            }
            if (message.excludedFor.includes(new mongoose_1.default.Types.ObjectId(userId))) {
                return res.status(403).json({ message: "You have already deleted this message" });
            }
            yield message_model_1.default.findByIdAndUpdate(messageId, {
                $addToSet: {
                    excludedFor: new mongoose_1.default.Types.ObjectId(userId),
                },
            });
            return res.status(200).json({ message: "Delete message successfully" });
        }
        catch (error) {
            next(error);
        }
    });
}
function retractMessageHandler(_req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const req = _req;
            const messageId = req.params.id;
            const userId = (_a = req.user._id) === null || _a === void 0 ? void 0 : _a.toString();
            const message = yield message_model_1.default.findById(messageId);
            if (!message) {
                return res.status(404).json({ message: "Message not found" });
            }
            if (message.sender.toString() !== userId) {
                return res.status(400).json({ message: "You are not the sender of this message" });
            }
            if (message.excludedFor.includes(new mongoose_1.default.Types.ObjectId(userId))) {
                return res.status(400).json({ message: "You have already deleted this message" });
            }
            yield message_model_1.default.findByIdAndUpdate(messageId, {
                isRetracted: true,
            });
            const updatedMessage = yield message_model_1.default.findOne({ _id: new mongoose_1.default.Types.ObjectId(messageId) })
                .populate({ path: "sender", select: user_model_1.USER_MODEL_HIDDEN_FIELDS })
                .populate({ path: "replyTo" })
                .populate({ path: "conversation" })
                .populate({ path: "reactions.user", select: user_model_1.USER_MODEL_HIDDEN_FIELDS });
            const conversationId = message.conversation.toString();
            // Send io
            const io = req.app.get("io");
            io.to(conversationId).emit("retractMessage", updatedMessage);
            return res.status(200).json({ message: "Retract message successfully" });
        }
        catch (error) {
            next(error);
        }
    });
}
function markMessageAsSeenHandler(_req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const req = _req;
            const userSeenId = req.body.userId;
            const conversationId = req.body.conversationId;
            yield message_model_1.default.updateMany({
                conversation: new mongoose_1.default.Types.ObjectId(conversationId),
                seenBy: { $nin: new mongoose_1.default.Types.ObjectId(userSeenId) },
            }, { $addToSet: { seenBy: new mongoose_1.default.Types.ObjectId(userSeenId) } });
            // Get last message and seen
            const lastMessage = yield message_model_1.default.findOne({
                conversation: new mongoose_1.default.Types.ObjectId(conversationId),
                seenBy: {
                    $in: [new mongoose_1.default.Types.ObjectId(userSeenId)],
                },
            })
                .sort({ createdAt: -1 })
                .populate({ path: "sender", select: user_model_1.USER_MODEL_HIDDEN_FIELDS })
                .populate({
                path: "conversation",
                populate: {
                    path: "participants",
                    select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
                },
            })
                .populate({ path: "replyTo" })
                .populate({ path: "seenBy", select: user_model_1.USER_MODEL_HIDDEN_FIELDS });
            // Send io
            const io = req.app.get("io");
            io.to(conversationId).emit("markMessageAsSeen", lastMessage);
            return res.status(200).json({ message: "Mark message as seen successfully" });
        }
        catch (error) {
            next(error);
        }
    });
}
function searchMessagesHandler(_req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const req = _req;
            const { search, conversationId } = req.query;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const userId = (_a = req.user._id) === null || _a === void 0 ? void 0 : _a.toString();
            if (!search || !conversationId) {
                return res.status(400).json({ message: "Search query is required" });
            }
            const conversation = yield conversation_model_1.default.findById(conversationId);
            if (!conversation) {
                return res.status(404).json({ message: "Conversation not found" });
            }
            const isMember = conversation.participants.some((participant) => participant._id.toString() === userId);
            if (!isMember) {
                return res.status(403).json({ message: "You are not a member of this conversation" });
            }
            const condition = {
                conversation: new mongoose_1.default.Types.ObjectId(conversation._id),
                excludedFor: { $nin: new mongoose_1.default.Types.ObjectId(userId) },
                content: {
                    $ne: null,
                    $nin: ["", " "],
                    $regex: search.toString().trim(),
                    $options: "i",
                },
            };
            const allMatchingMessages = yield message_model_1.default.find(condition).sort({ createdAt: -1 });
            const totalMessages = allMatchingMessages.length;
            const totalPages = Math.ceil(totalMessages / limit);
            const skip = (page - 1) * limit;
            const messages = yield message_model_1.default.find(condition)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .populate({
                path: "sender",
                select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
            })
                .populate({
                path: "seenBy",
                select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
            })
                .populate({
                path: "replyTo",
            })
                .populate({
                path: "conversation",
            })
                .populate({
                path: "reactions.user",
            });
            return res.status(200).json({
                message: "Search messages successfully",
                data: messages,
                totalMessages,
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
//# sourceMappingURL=message.controller.js.map