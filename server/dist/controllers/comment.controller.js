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
exports.createCommentHandler = createCommentHandler;
exports.getCommentsByTargetHandler = getCommentsByTargetHandler;
exports.getRepliesHandler = getRepliesHandler;
exports.likeCommentHandler = likeCommentHandler;
exports.unlikeCommentHandler = unlikeCommentHandler;
exports.deleteCommentHandler = deleteCommentHandler;
const comment_schema_1 = require("../schemas/comment.schema");
const text_parser_1 = require("../shared/helpers/text-parser");
const user_model_1 = __importStar(require("../models/user.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const comment_model_1 = __importDefault(require("../models/comment.model"));
function createCommentHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { commentBy, content, rootComment, replyTo, target, targetType } = comment_schema_1.createCommentSchema.parse(req.body);
            const { mentions: mentionUsernames, tags } = (0, text_parser_1.extractMentionsAndTags)(content);
            const formatContent = yield (0, text_parser_1.replaceHrefs)(content);
            // Extract mention to userId
            const mentionUserIds = [];
            const userInMentions = yield user_model_1.default.find({
                username: { $in: mentionUsernames },
            });
            userInMentions.forEach((user) => {
                const userId = new mongoose_1.default.Types.ObjectId(user._id);
                mentionUserIds.push(userId);
            });
            const comment = yield comment_model_1.default.create({
                targetType: targetType !== null && targetType !== void 0 ? targetType : "Post",
                target: new mongoose_1.default.Types.ObjectId(target),
                commentBy: new mongoose_1.default.Types.ObjectId(commentBy),
                rootComment: rootComment ? new mongoose_1.default.Types.ObjectId(rootComment) : null,
                replyTo: replyTo ? new mongoose_1.default.Types.ObjectId(replyTo) : null,
                content: formatContent,
                mentions: mentionUserIds,
                tags,
            });
            yield comment_model_1.default.populate(comment, [{ path: "commentBy", select: user_model_1.USER_MODEL_HIDDEN_FIELDS }]);
            return res.json({
                message: "Create comment successfully",
                data: comment,
            });
        }
        catch (error) {
            next(error);
        }
    });
}
function getCommentsByTargetHandler(_req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        try {
            const req = _req;
            const targetType = req.query.targetType;
            const target = req.query.target;
            const page = (_a = Number(req.query.page)) !== null && _a !== void 0 ? _a : 1;
            const limit = (_b = Number(req.query.limit)) !== null && _b !== void 0 ? _b : 15;
            // Build condition based on authentication status
            let condition = {
                target: new mongoose_1.default.Types.ObjectId(target),
                targetType: targetType,
                replyTo: null,
            };
            // If user is authenticated, filter out blocked users
            if ((_c = req.user) === null || _c === void 0 ? void 0 : _c._id) {
                const currentUserId = req.user._id.toString();
                const currentUser = yield user_model_1.default.findById(currentUserId);
                const blockedUsers = (_d = currentUser === null || currentUser === void 0 ? void 0 : currentUser.blockedUsers) !== null && _d !== void 0 ? _d : [];
                // Users: Blocked me
                const blockedByUsers = yield user_model_1.default.find({
                    blockedUsers: {
                        $in: [new mongoose_1.default.Types.ObjectId(currentUserId)],
                    },
                }).distinct("_id");
                condition.$or = [
                    { commentBy: currentUser === null || currentUser === void 0 ? void 0 : currentUser._id }, // Include my posts
                    { commentBy: { $nin: [...blockedUsers, ...blockedByUsers] } }, // Exclude posts from both blocked and blocking users
                ];
            }
            const skip = (Number(page) - 1) * limit;
            const totalComments = yield comment_model_1.default.countDocuments(condition);
            const totalPages = Math.ceil(totalComments / limit);
            const comments = yield comment_model_1.default.aggregate([
                { $match: condition },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
                {
                    // Join postBy field with users collection
                    $lookup: {
                        from: "users",
                        localField: "commentBy",
                        foreignField: "_id",
                        as: "commentBy",
                    },
                },
                { $unwind: "$commentBy" }, // Deconstruct commentBy array to object
                {
                    $lookup: {
                        from: "users",
                        localField: "mentions",
                        foreignField: "_id",
                        as: "mentions",
                    },
                },
                {
                    $lookup: {
                        from: "comments",
                        localField: "_id",
                        foreignField: "rootComment",
                        as: "replies",
                    },
                },
                {
                    $addFields: {
                        replyCount: { $size: "$replies" },
                        likeCount: { $size: "$likes" },
                    },
                },
                {
                    $project: {
                        "commentBy.password": 0, // Exclude sensitive fields
                        "commentBy.refreshToken": 0,
                        "commentBy.__v": 0,
                        "mentions.password": 0,
                        "mentions.refreshToken": 0,
                        "mentions.__v": 0,
                        replies: 0,
                    },
                },
            ]);
            return res.json({
                message: "Get all comments successfully",
                data: comments,
                page,
                limit,
                totalComments,
                totalPages,
            });
        }
        catch (error) {
            next(error);
        }
    });
}
function getRepliesHandler(_req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        try {
            const req = _req;
            const rootComment = req.query.rootComment;
            const page = (_a = Number(req.query.page)) !== null && _a !== void 0 ? _a : 1;
            const limit = (_b = Number(req.query.limit)) !== null && _b !== void 0 ? _b : 15;
            // Build condition based on authentication status
            let condition = {
                rootComment: new mongoose_1.default.Types.ObjectId(rootComment),
            };
            // If user is authenticated, filter out blocked users
            if ((_c = req.user) === null || _c === void 0 ? void 0 : _c._id) {
                const currentUserId = req.user._id.toString();
                const currentUser = yield user_model_1.default.findById(currentUserId);
                const blockedUsers = (_d = currentUser === null || currentUser === void 0 ? void 0 : currentUser.blockedUsers) !== null && _d !== void 0 ? _d : [];
                // Users: Blocked me
                const blockedByUsers = yield user_model_1.default.find({
                    blockedUsers: {
                        $in: [new mongoose_1.default.Types.ObjectId(currentUserId)],
                    },
                }).distinct("_id");
                condition.$or = [
                    { commentBy: currentUser === null || currentUser === void 0 ? void 0 : currentUser._id }, // Include my posts
                    { commentBy: { $nin: [...blockedUsers, ...blockedByUsers] } }, // Exclude posts from both blocked and blocking users
                ];
            }
            const skip = (Number(page) - 1) * limit;
            const totalComments = yield comment_model_1.default.countDocuments(condition);
            const totalPages = Math.ceil(totalComments / limit);
            const replies = yield comment_model_1.default.aggregate([
                { $match: condition },
                { $sort: { createdAt: 1 } },
                { $skip: skip },
                { $limit: limit },
                {
                    // Join postBy field with users collection
                    $lookup: {
                        from: "users",
                        localField: "commentBy",
                        foreignField: "_id",
                        as: "commentBy",
                    },
                },
                { $unwind: "$commentBy" }, // Deconstruct commentBy array to object
                {
                    $lookup: {
                        from: "users",
                        localField: "mentions",
                        foreignField: "_id",
                        as: "mentions",
                    },
                },
                {
                    $addFields: {
                        likeCount: { $size: "$likes" },
                    },
                },
                {
                    $project: {
                        "commentBy.password": 0, // Exclude sensitive fields
                        "commentBy.refreshToken": 0,
                        "commentBy.__v": 0,
                        "mentions.password": 0,
                        "mentions.refreshToken": 0,
                        "mentions.__v": 0,
                    },
                },
            ]);
            return res.json({
                message: "Get all comments successfully",
                data: replies,
                page,
                limit,
                totalComments,
                totalPages,
            });
        }
        catch (error) {
            next(error);
        }
    });
}
function likeCommentHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { commentId, userId } = req.body;
            if (!commentId || !userId) {
                return res.status(400).json({
                    message: "commentId or userId is required",
                });
            }
            const updatedComment = yield comment_model_1.default.findByIdAndUpdate(commentId, {
                $push: { likes: userId },
            });
            if (!updatedComment) {
                return res.status(404).json({ message: "Comment not found" });
            }
            const comment = yield comment_model_1.default.populate(updatedComment, [
                { path: "commentBy", select: user_model_1.USER_MODEL_HIDDEN_FIELDS },
                { path: "mentions", select: user_model_1.USER_MODEL_HIDDEN_FIELDS },
            ]);
            return res.status(200).json({ message: "Comment liked successfully", data: comment });
        }
        catch (error) {
            next(error);
        }
    });
}
function unlikeCommentHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { commentId, userId } = req.body;
            if (!commentId || !userId) {
                return res.status(400).json({
                    message: "commentId or userId is required",
                });
            }
            const updatedComment = yield comment_model_1.default.findByIdAndUpdate(commentId, {
                $pull: { likes: userId },
            });
            if (!updatedComment) {
                return res.status(404).json({ message: "Comment not found" });
            }
            const comment = yield comment_model_1.default.populate(updatedComment, [
                { path: "commentBy", select: user_model_1.USER_MODEL_HIDDEN_FIELDS },
                { path: "mentions", select: user_model_1.USER_MODEL_HIDDEN_FIELDS },
            ]);
            return res.status(200).json({ message: "Comment unliked successfully", data: comment });
        }
        catch (error) {
            next(error);
        }
    });
}
function deleteCommentHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const commentId = req.params.id;
            if (!commentId) {
                return res.status(400).json({
                    message: "commentId is required",
                });
            }
            const comment = yield comment_model_1.default.findById(commentId);
            if (!comment) {
                return res.status(404).json({ message: "Comment not found" });
            }
            const isRootComment = comment.replyTo == null;
            if (isRootComment) {
                // Delete all replies of root comment
                yield comment_model_1.default.deleteMany({ rootComment: new mongoose_1.default.Types.ObjectId(commentId) });
            }
            yield comment_model_1.default.findByIdAndDelete(commentId);
            return res.status(200).json({ message: "Comment deleted successfully" });
        }
        catch (error) {
            next(error);
        }
    });
}
//# sourceMappingURL=comment.controller.js.map