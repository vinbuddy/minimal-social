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
exports.createPostHandler = createPostHandler;
exports.editPostHandler = editPostHandler;
exports.deletePostHandler = deletePostHandler;
exports.getAllPostsHandler = getAllPostsHandler;
exports.getFollowingPostsHandler = getFollowingPostsHandler;
exports.getPostDetailHandler = getPostDetailHandler;
exports.getLikedPostsHandler = getLikedPostsHandler;
exports.getUserPostsHandler = getUserPostsHandler;
exports.likePostHandler = likePostHandler;
exports.unlikePostHandler = unlikePostHandler;
exports.repostHandler = repostHandler;
exports.unRepostHandler = unRepostHandler;
exports.getUsersLikedPostHandler = getUsersLikedPostHandler;
exports.getUsersRepostedPostHandler = getUsersRepostedPostHandler;
const post_model_1 = __importDefault(require("../models/post.model"));
const text_parser_1 = require("../shared/helpers/text-parser");
const user_model_1 = __importStar(require("../models/user.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const post_schema_1 = require("../schemas/post.schema");
const cloudinary_1 = require("../shared/helpers/cloudinary");
const cloudinary_2 = __importDefault(require("../shared/configs/cloudinary"));
const comment_model_1 = __importDefault(require("../models/comment.model"));
const post_service_1 = require("../services/post.service");
const media_moderation_1 = require("../shared/helpers/media-moderation");
function createPostHandler(_req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const req = _req;
            const { postBy, caption } = post_schema_1.createPostSchema.parse(req.body);
            const files = req.files;
            let uploadedFiles = [];
            if (files && files.length > 0) {
                const uploadPromises = files.map((file) => {
                    let uploadPromise = (0, cloudinary_1.uploadToCloudinary)(file, "posts");
                    return uploadPromise;
                });
                uploadedFiles = yield Promise.all(uploadPromises);
            }
            if (uploadedFiles.length > 0) {
                // Check image moderation, check if has any image that is not safe -> delete all uploaded files
                const imageModerationPromises = uploadedFiles.map((file) => (0, media_moderation_1.moderateImage)(file.url));
                const imageModerationResults = yield Promise.all(imageModerationPromises);
                const isNotSafe = imageModerationResults.some((result) => result === false);
                if (isNotSafe) {
                    const promises = uploadedFiles.map((file) => cloudinary_2.default.uploader.destroy(file.publicId));
                    yield Promise.all(promises);
                    return res.status(400).json({ message: "Image contains nudity, please upload another image" });
                }
            }
            const { mentions: mentionUsernames, tags } = (0, text_parser_1.extractMentionsAndTags)(caption);
            const formatCaption = yield (0, text_parser_1.replaceHrefs)(caption);
            const mentionUserIds = [];
            const userInMentions = yield user_model_1.default.find({
                username: { $in: mentionUsernames },
            });
            userInMentions.forEach((user) => {
                const userId = new mongoose_1.default.Types.ObjectId(user._id);
                mentionUserIds.push(userId);
            });
            const newPost = yield post_model_1.default.create({
                postBy: new mongoose_1.default.Types.ObjectId(postBy),
                caption: formatCaption,
                mentions: mentionUserIds,
                tags,
                mediaFiles: (_a = uploadedFiles) !== null && _a !== void 0 ? _a : [],
            });
            yield newPost.save();
            const post = yield post_model_1.default.populate(newPost, [
                { path: "postBy", select: user_model_1.USER_MODEL_HIDDEN_FIELDS },
                { path: "mentions", select: user_model_1.USER_MODEL_HIDDEN_FIELDS },
            ]);
            return res.status(200).json({ message: "Create post successfully", data: post });
        }
        catch (error) {
            next(error);
        }
    });
}
function editPostHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { caption, postId } = post_schema_1.editPostSchema.parse(req.body);
            const { mentions: mentionUsernames, tags } = (0, text_parser_1.extractMentionsAndTags)(caption);
            const formatCaption = yield (0, text_parser_1.replaceHrefs)(caption);
            const mentionUserIds = [];
            const userInMentions = yield user_model_1.default.find({
                username: { $in: mentionUsernames },
            });
            userInMentions.forEach((user) => {
                const userId = new mongoose_1.default.Types.ObjectId(user._id);
                mentionUserIds.push(userId);
            });
            const updatedPost = yield post_model_1.default.findByIdAndUpdate(postId, {
                caption: formatCaption,
                mentions: mentionUserIds,
                tags,
                isEdited: true,
            });
            if (!updatedPost) {
                return res.status(404).json({ message: "Post not found" });
            }
            const post = yield post_model_1.default.populate(updatedPost, [
                { path: "postBy", select: user_model_1.USER_MODEL_HIDDEN_FIELDS },
                { path: "mentions", select: user_model_1.USER_MODEL_HIDDEN_FIELDS },
            ]);
            return res.status(200).json({ message: "Edit post successfully", data: post });
        }
        catch (error) {
            next(error);
        }
    });
}
function deletePostHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ message: "Post ID is required" });
            }
            const post = yield post_model_1.default.findById(id);
            const mediaFiles = post && post.mediaFiles;
            if (mediaFiles && mediaFiles.length > 0) {
                const promises = mediaFiles.map((file) => cloudinary_2.default.uploader.destroy(file.publicId));
                yield Promise.all(promises);
            }
            yield post_model_1.default.findByIdAndDelete(id);
            yield comment_model_1.default.deleteMany({ target: new mongoose_1.default.Types.ObjectId(id) });
            return res.status(200).json({ message: "Delete post successfully" });
        }
        catch (error) { }
    });
}
function getAllPostsHandler(_req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const req = _req;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 15;
            // Me: Blocked some users
            const currentUserId = (_a = req.user._id) === null || _a === void 0 ? void 0 : _a.toString();
            const currentUser = yield user_model_1.default.findById(currentUserId);
            const blockedUsers = (_b = currentUser === null || currentUser === void 0 ? void 0 : currentUser.blockedUsers) !== null && _b !== void 0 ? _b : [];
            // Users: Blocked me
            const blockedByUsers = yield user_model_1.default.find({
                blockedUsers: {
                    $in: [new mongoose_1.default.Types.ObjectId(currentUserId)],
                },
            }).distinct("_id");
            const condition = {
                $or: [
                    { postBy: currentUser === null || currentUser === void 0 ? void 0 : currentUser._id }, // Include my posts
                    { postBy: { $nin: [...blockedUsers, ...blockedByUsers] } }, // Exclude posts from both blocked and blocking users
                ],
            };
            const skip = (Number(page) - 1) * limit;
            const totalPosts = yield post_model_1.default.countDocuments(condition);
            const totalPages = Math.ceil(totalPosts / limit);
            const posts = yield post_model_1.default.aggregate([
                {
                    $match: condition,
                },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
                ...post_service_1.getPostQueryHelper.postLookups,
                ...post_service_1.getPostQueryHelper.originalPostLookups,
                {
                    $project: Object.assign(Object.assign({}, post_service_1.getPostQueryHelper.projectFields), { comment: 0 }),
                },
            ]);
            return res
                .status(200)
                .json({ message: "Get all posts successfully", data: posts, totalPosts, totalPages, page, limit });
        }
        catch (error) {
            next(error);
        }
    });
}
function getFollowingPostsHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            // const req = _req as RequestWithUser;
            const userId = req.query.userId;
            // const userId = req.user._id?.toString();
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 15;
            const skip = (Number(page) - 1) * limit;
            const user = yield user_model_1.default.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            const followingIds = (_a = user === null || user === void 0 ? void 0 : user.followings) !== null && _a !== void 0 ? _a : [];
            const totalPosts = yield post_model_1.default.countDocuments({
                postBy: { $in: followingIds }, // Get following posts
            });
            const totalPages = Math.ceil(totalPosts / limit);
            const posts = yield post_model_1.default.aggregate([
                { $match: { postBy: { $in: followingIds } } },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
                ...post_service_1.getPostQueryHelper.postLookups,
                ...post_service_1.getPostQueryHelper.originalPostLookups,
                {
                    $project: Object.assign(Object.assign({}, post_service_1.getPostQueryHelper.projectFields), { comment: 0 }),
                },
            ]);
            return res
                .status(200)
                .json({ message: "Get following posts successfully", data: posts, totalPosts, totalPages, page, limit });
        }
        catch (error) {
            next(error);
        }
    });
}
function getPostDetailHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const postId = req.params.id;
            if (!postId) {
                return res.status(400).json({ message: "Post ID is required" });
            }
            const post = yield post_model_1.default.aggregate([
                { $match: { _id: new mongoose_1.default.Types.ObjectId(postId) } },
                {
                    // Join postBy field with users collection
                    $lookup: {
                        from: "users",
                        localField: "postBy",
                        foreignField: "_id",
                        as: "postBy",
                    },
                },
                { $unwind: "$postBy" }, // Deconstruct postBy array to object
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
                        foreignField: "target",
                        as: "comments",
                    },
                },
                {
                    $addFields: {
                        likeCount: { $size: "$likes" },
                        commentCount: { $size: "$comments" },
                    },
                },
                {
                    $project: {
                        "postBy.password": 0, // Exclude sensitive fields
                        "postBy.refreshToken": 0,
                        "postBy.__v": 0,
                        "mentions.password": 0,
                        "mentions.refreshToken": 0,
                        "mentions.__v": 0,
                        comments: 0, // Exclude comments array
                    },
                },
            ]);
            return res.status(200).json({ message: "Get post detail successfully", data: post[0] });
        }
        catch (error) {
            next(error);
        }
    });
}
function getLikedPostsHandler(_req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const req = _req;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 15;
            // Me: Blocked some users
            const currentUserId = (_a = req.user._id) === null || _a === void 0 ? void 0 : _a.toString();
            const currentUser = yield user_model_1.default.findById(currentUserId);
            const blockedUsers = (_b = currentUser === null || currentUser === void 0 ? void 0 : currentUser.blockedUsers) !== null && _b !== void 0 ? _b : [];
            // Users: Blocked me
            const blockedByUsers = yield user_model_1.default.find({
                blockedUsers: {
                    $in: [new mongoose_1.default.Types.ObjectId(currentUserId)],
                },
            }).distinct("_id");
            const condition = {
                $and: [
                    { likes: { $in: [currentUser === null || currentUser === void 0 ? void 0 : currentUser._id] } }, // Include my liked posts
                    { postBy: { $nin: [...blockedUsers, ...blockedByUsers] } }, // Exclude posts from both blocked and blocking users
                ],
            };
            const skip = (page - 1) * limit;
            const totalPosts = yield post_model_1.default.countDocuments(condition);
            const totalPages = Math.ceil(totalPosts / limit);
            const posts = yield post_model_1.default.aggregate([
                { $match: condition },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
                ...post_service_1.getPostQueryHelper.postLookups,
                ...post_service_1.getPostQueryHelper.originalPostLookups,
                {
                    $project: Object.assign(Object.assign({}, post_service_1.getPostQueryHelper.projectFields), { comment: 0 }),
                },
            ]);
            return res
                .status(200)
                .json({ message: "Get following posts successfully", data: posts, totalPosts, totalPages, page, limit });
        }
        catch (error) {
            next(error);
        }
    });
}
function getUserPostsHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.query.userId;
            const type = req.query.type;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 15;
            const skip = (page - 1) * limit;
            const user = yield user_model_1.default.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            let condition = {
                postBy: new mongoose_1.default.Types.ObjectId(userId),
            };
            if (type === "repost") {
                condition = {
                    reposts: { $in: [new mongoose_1.default.Types.ObjectId(userId)] },
                };
            }
            const totalPosts = yield post_model_1.default.countDocuments(condition);
            const totalPages = Math.ceil(totalPosts / limit);
            const posts = yield post_model_1.default.aggregate([
                { $match: condition },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
                ...post_service_1.getPostQueryHelper.postLookups,
                ...post_service_1.getPostQueryHelper.originalPostLookups,
                {
                    $project: Object.assign(Object.assign({}, post_service_1.getPostQueryHelper.projectFields), { comment: 0 }),
                },
            ]);
            return res
                .status(200)
                .json({ message: "Get following posts successfully", data: posts, totalPosts, totalPages, page, limit });
        }
        catch (error) {
            next(error);
        }
    });
}
function likePostHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { postId, userId } = req.body;
            const updatedPost = yield post_model_1.default.findByIdAndUpdate(postId, {
                $push: { likes: userId },
            });
            if (!updatedPost) {
                return res.status(404).json({ message: "Post not found" });
            }
            const post = yield post_model_1.default.populate(updatedPost, [
                { path: "postBy", select: user_model_1.USER_MODEL_HIDDEN_FIELDS },
                { path: "mentions", select: user_model_1.USER_MODEL_HIDDEN_FIELDS },
            ]);
            return res.status(200).json({ message: "Post liked successfully", data: post });
        }
        catch (error) {
            next(error);
        }
    });
}
function unlikePostHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { postId, userId } = req.body;
            const updatedPost = yield post_model_1.default.findByIdAndUpdate(postId, {
                $pull: { likes: userId },
            });
            if (!updatedPost) {
                return res.status(404).json({ message: "Post not found" });
            }
            const post = yield post_model_1.default.populate(updatedPost, [
                { path: "postBy", select: user_model_1.USER_MODEL_HIDDEN_FIELDS },
                { path: "mentions", select: user_model_1.USER_MODEL_HIDDEN_FIELDS },
            ]);
            return res.status(200).json({ message: "Post unliked successfully", data: post });
        }
        catch (error) {
            next(error);
        }
    });
}
function repostHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { postId, userId } = req.body;
            const post = yield post_model_1.default.findById(postId);
            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }
            const repostedPost = yield post_model_1.default.create({
                postBy: new mongoose_1.default.Types.ObjectId(userId),
                originalPost: new mongoose_1.default.Types.ObjectId(postId),
            });
            yield post_model_1.default.findByIdAndUpdate(postId, {
                $push: { reposts: userId },
            });
            yield repostedPost.save();
            const newPost = yield post_model_1.default.populate(repostedPost, [
                { path: "postBy", select: user_model_1.USER_MODEL_HIDDEN_FIELDS },
                { path: "mentions", select: user_model_1.USER_MODEL_HIDDEN_FIELDS },
            ]);
            return res.status(200).json({ message: "Repost post successfully", data: newPost });
        }
        catch (error) {
            next(error);
        }
    });
}
function unRepostHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { originalPostId, postId, userId } = req.body;
            const post = yield post_model_1.default.findById(postId);
            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }
            yield post_model_1.default.findByIdAndUpdate(originalPostId, {
                $pull: { reposts: userId },
            });
            yield post_model_1.default.findByIdAndDelete(postId);
            return res.status(200).json({ message: "Unrepost post successfully" });
        }
        catch (error) {
            next(error);
        }
    });
}
// Post Activities
function getUsersLikedPostHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const postId = req.params.id;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 5;
            if (!postId) {
                return res.status(400).json({ message: "Post ID is required" });
            }
            const post = yield post_model_1.default.findById(postId);
            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }
            // Pagination
            const skip = (Number(page) - 1) * limit;
            const totalUsers = post.likes.length;
            const totalPages = Math.ceil(totalUsers / limit);
            // Get users with pagination
            const users = yield user_model_1.default.find({
                _id: { $in: post.likes },
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select(user_model_1.USER_MODEL_HIDDEN_FIELDS);
            return res
                .status(200)
                .json({ message: "Get users liked post successfully", data: users, totalUsers, totalPages, page, limit });
        }
        catch (error) {
            next(error);
        }
    });
}
function getUsersRepostedPostHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const postId = req.params.id;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 5;
            if (!postId) {
                return res.status(400).json({ message: "Post ID is required" });
            }
            const post = yield post_model_1.default.findById(postId);
            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }
            // Pagination
            const skip = (Number(page) - 1) * limit;
            const totalUsers = post.likes.length;
            const totalPages = Math.ceil(totalUsers / limit);
            const users = yield user_model_1.default.find({
                _id: { $in: post.reposts },
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select(user_model_1.USER_MODEL_HIDDEN_FIELDS);
            return res.status(200).json({
                message: "Get users reposted post successfully",
                data: users,
                totalUsers,
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
//# sourceMappingURL=post.controller.js.map