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
exports.createPrivateConversationHandler = createPrivateConversationHandler;
exports.getConversationsHandler = getConversationsHandler;
exports.searchConversationsByNameHandler = searchConversationsByNameHandler;
exports.getConversationDetailHandler = getConversationDetailHandler;
exports.getConversationMediaFilesHandler = getConversationMediaFilesHandler;
exports.changeConversationEmojiHandler = changeConversationEmojiHandler;
exports.changeThemeConversationHandler = changeThemeConversationHandler;
exports.getConversationLinksHandler = getConversationLinksHandler;
exports.deleteConversationHandler = deleteConversationHandler;
const conversation_model_1 = __importDefault(require("../models/conversation.model"));
const user_model_1 = __importStar(require("../models/user.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const message_model_1 = __importDefault(require("../models/message.model"));
function createPrivateConversationHandler(_req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const req = _req;
            const participants = req.body.participants;
            const userId = (_a = req.user._id) === null || _a === void 0 ? void 0 : _a.toString();
            const participantIds = participants.map((participant) => new mongoose_1.default.Types.ObjectId(participant));
            // Check if the conversation already exists
            const conversation = yield conversation_model_1.default.findOne({
                isGroup: false,
                participants: {
                    $all: participantIds,
                },
            }).populate({ path: "participants.user", select: user_model_1.USER_MODEL_HIDDEN_FIELDS });
            // Check if userId is in hiddenBy of the conversation -> pull userId out of hiddenBy
            const isHidden = conversation === null || conversation === void 0 ? void 0 : conversation.hiddenBy.includes(new mongoose_1.default.Types.ObjectId(userId));
            if (isHidden && conversation) {
                yield conversation_model_1.default.findByIdAndUpdate(conversation._id, {
                    $pull: { hiddenBy: new mongoose_1.default.Types.ObjectId(userId) },
                });
            }
            if (conversation) {
                return res.status(200).json({
                    message: "Conversation already exists",
                    data: conversation,
                });
            }
            // Create a new conversation
            const createdConversation = yield conversation_model_1.default.create({
                participants: participantIds,
            });
            const newConversation = yield conversation_model_1.default.populate(createdConversation, {
                path: "participants",
                select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
            });
            return res.status(201).json({
                message: "Create conversation successfully",
                data: newConversation,
            });
        }
        catch (error) {
            next(error);
        }
    });
}
function getConversationsHandler(_req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            // const userId = req.query.userId;
            const req = _req;
            const userId = (_a = req.user._id) === null || _a === void 0 ? void 0 : _a.toString();
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 15;
            const condition = {
                participants: {
                    $in: [userId],
                },
                hiddenBy: { $ne: new mongoose_1.default.Types.ObjectId(userId) },
            };
            const skip = (Number(page) - 1) * limit;
            const totalConversations = yield conversation_model_1.default.countDocuments(condition);
            const totalPages = Math.ceil(totalConversations / limit);
            // Get all conversations of the user
            const conversations = yield conversation_model_1.default.find(condition)
                .skip(skip)
                .limit(limit)
                .sort({ updatedAt: -1 })
                .populate({
                path: "participants",
                select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
                populate: {
                    path: "blockedUsers",
                    select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
                },
            })
                .populate("theme")
                .lean();
            const conversationWithUnreadCount = yield Promise.all(conversations.map((conversation) => __awaiter(this, void 0, void 0, function* () {
                const unreadCount = yield message_model_1.default.countDocuments({
                    conversation: conversation._id,
                    seenBy: { $nin: [new mongoose_1.default.Types.ObjectId(userId)] },
                });
                return Object.assign(Object.assign({}, conversation), { unreadCount });
            })));
            return res.status(200).json({
                message: "Get conversations successfully",
                data: conversationWithUnreadCount,
                totalConversations,
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
function searchConversationsByNameHandler(_req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const req = _req;
            // Find conversation by name or username
            const search = req.query.search;
            // const userId = req.query.userId as string;
            const userId = (_a = req.user._id) === null || _a === void 0 ? void 0 : _a.toString();
            if (!search) {
                return res.status(400).json({ error: "Search name is required" });
            }
            const users = yield user_model_1.default.find({ username: { $regex: search, $options: "i" } })
                .limit(10)
                .select(user_model_1.USER_MODEL_HIDDEN_FIELDS)
                .lean();
            if (users.length === 0) {
                return res.status(200).json({
                    message: "No users found with the given search term",
                    data: [],
                });
            }
            // const userIds = users.map((user) => user._id);
            const currentUserId = new mongoose_1.default.Types.ObjectId(userId);
            const conversationPromises = users.map((user) => __awaiter(this, void 0, void 0, function* () {
                const conversation = yield conversation_model_1.default.findOne({
                    isGroup: false,
                    participants: {
                        $all: [currentUserId, user._id],
                    },
                    $expr: {
                        $eq: [{ $size: "$participants" }, 2],
                    },
                }).populate({ path: "participants", select: user_model_1.USER_MODEL_HIDDEN_FIELDS });
                return {
                    conversation: conversation !== null && conversation !== void 0 ? conversation : null,
                    user: user,
                };
            }));
            const privateConversations = yield Promise.all(conversationPromises);
            // Get group conversations
            const groupConversations = yield conversation_model_1.default.find({
                isGroup: true,
                "groupInfo.name": { $regex: search, $options: "i" },
            }).populate({ path: "participants", select: user_model_1.USER_MODEL_HIDDEN_FIELDS });
            return res.status(200).json({
                message: "Search successfully",
                data: {
                    privateConversations,
                    groupConversations,
                },
            });
        }
        catch (error) {
            next(error);
        }
    });
}
function getConversationDetailHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const conversationId = req.params.id;
            const conversation = yield conversation_model_1.default.findById(conversationId)
                .populate({
                path: "participants",
                select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
                populate: {
                    path: "blockedUsers",
                    select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
                },
            })
                .populate("theme");
            if (!conversation) {
                return res.status(404).json({
                    message: "Conversation not found",
                });
            }
            return res.status(200).json({
                message: "Get conversation detail successfully",
                data: conversation,
            });
        }
        catch (error) {
            next(error);
        }
    });
}
function getConversationMediaFilesHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const conversationId = req.query.conversationId;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            if (!conversationId)
                return res.status(400).json({ message: "Conversation ID is required" });
            const skip = (Number(page) - 1) * limit;
            const condition = {
                mediaFiles: { $ne: [] },
                conversation: new mongoose_1.default.Types.ObjectId(conversationId),
                isRetracted: false,
            };
            const messagesWithMediaFile = yield message_model_1.default.find(condition)
                .select("mediaFiles createdAt")
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .lean();
            const totalMediaFiles = yield message_model_1.default.countDocuments(condition);
            const totalPages = Math.ceil(totalMediaFiles / limit);
            const mediaFiles = messagesWithMediaFile.flatMap((message) => message.mediaFiles);
            return res.status(200).json({
                message: "Get media files successfully",
                data: mediaFiles,
                totalMediaFiles,
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
function changeConversationEmojiHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const conversationId = req.params.id;
            const emoji = req.body.emoji;
            const conversation = yield conversation_model_1.default.findByIdAndUpdate(conversationId, {
                emoji,
            });
            if (!conversation) {
                return res.status(404).json({
                    message: "Conversation not found",
                });
            }
            return res.status(200).json({
                message: "Change emoji successfully",
                data: conversation,
            });
        }
        catch (error) {
            next(error);
        }
    });
}
function changeThemeConversationHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const conversationId = req.params.id;
            const themeId = req.body.themeId;
            const conversation = yield conversation_model_1.default.findByIdAndUpdate(conversationId, {
                theme: new mongoose_1.default.Types.ObjectId(themeId),
            });
            if (!conversation) {
                return res.status(404).json({
                    message: "Conversation not found",
                });
            }
            return res.status(200).json({
                message: "Change theme successfully",
                data: conversation,
            });
        }
        catch (error) {
            next(error);
        }
    });
}
function getConversationLinksHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const conversationId = req.query.conversationId;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            if (!conversationId)
                return res.status(400).json({ message: "Conversation ID is required" });
            const skip = (Number(page) - 1) * limit;
            const urlRegex = /(https?:\/\/(?:www\.)?[^\s/$.?#].[^\s]*)/i;
            const condition = {
                links: { $ne: [] },
                conversation: new mongoose_1.default.Types.ObjectId(conversationId),
                isRetracted: false,
                content: { $regex: urlRegex },
            };
            const messagesWithLinks = yield message_model_1.default.find(condition)
                .select("content createdAt")
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .lean();
            const totalLinks = yield message_model_1.default.countDocuments(condition);
            const totalPages = Math.ceil(totalLinks / limit);
            const messageLinks = messagesWithLinks.map((message) => {
                const links = (message.content.match(urlRegex) || []).map((link) => link.trim());
                return {
                    createdAt: message.createdAt,
                    links: Array.from(new Set(links)), // Using Set to remove duplicate links and convert back to array
                };
            });
            return res.status(200).json({
                message: "Get links successfully",
                data: messageLinks,
                totalLinks,
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
function deleteConversationHandler(_req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const req = _req;
            const conversationId = req.params.id;
            const userId = (_a = req.user._id) === null || _a === void 0 ? void 0 : _a.toString();
            // Push userId to excluded
            yield message_model_1.default.updateMany({ conversation: conversationId }, { $addToSet: { excludedFor: new mongoose_1.default.Types.ObjectId(userId) } });
            yield conversation_model_1.default.findByIdAndUpdate(conversationId, {
                $addToSet: { hiddenBy: new mongoose_1.default.Types.ObjectId(userId) },
            });
            return res.status(200).json({
                message: "Delete conversation successfully",
            });
        }
        catch (error) {
            next(error);
        }
    });
}
//# sourceMappingURL=conversation.controller.js.map