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
exports.getUsersHandler = getUsersHandler;
exports.getUserHandler = getUserHandler;
exports.searchUserHandler = searchUserHandler;
exports.followUserHandler = followUserHandler;
exports.unfollowUserHandler = unfollowUserHandler;
exports.getFollowSuggestionsHandler = getFollowSuggestionsHandler;
exports.editProfileHandler = editProfileHandler;
exports.getFollowingsHandler = getFollowingsHandler;
exports.getFollowersHandler = getFollowersHandler;
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = __importStar(require("../models/user.model"));
const user_schema_1 = require("../schemas/user.schema");
const cloudinary_1 = __importDefault(require("../shared/configs/cloudinary"));
const cloudinary_2 = require("../shared/helpers/cloudinary");
function getUsersHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const users = yield user_model_1.default.find().select(user_model_1.USER_MODEL_HIDDEN_FIELDS);
            return res.status(200).json({ statusCode: 200, data: users });
        }
        catch (error) {
            next(error);
        }
    });
}
function getUserHandler(_req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const req = _req;
            const id = req.params.id;
            const currentUserId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString();
            if (!id) {
                return res.status(400).json({ statusCode: 400, message: "Id is required" });
            }
            const currentUser = yield user_model_1.default.findById(currentUserId);
            const user = yield user_model_1.default.findById(id).select(user_model_1.USER_MODEL_HIDDEN_FIELDS);
            // Check if currentUser is blocked by user accessing
            const isBlocked = user === null || user === void 0 ? void 0 : user.blockedUsers.includes(new mongoose_1.default.Types.ObjectId(currentUserId));
            if (isBlocked) {
                return res.status(403).json({ message: "You are blocked by this user" });
            }
            return res.status(200).json({ statusCode: 200, data: user });
        }
        catch (error) {
            next(error);
        }
    });
}
function searchUserHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const query = req.query.query;
            const users = yield user_model_1.default.find({
                $or: [{ username: { $regex: query, $options: "i" } }],
            }).select(user_model_1.USER_MODEL_HIDDEN_FIELDS);
            return res.status(200).json({ statusCode: 200, data: users });
        }
        catch (error) {
            next(error);
        }
    });
}
function followUserHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId, currentUserId } = user_schema_1.followUserSchema.parse(req.body);
            if (currentUserId === userId) {
                return res.status(400).json({ message: "You cannot follow yourself" });
            }
            const userToFollow = yield user_model_1.default.findById(userId);
            const currentUser = yield user_model_1.default.findById(currentUserId);
            if (!userToFollow || !currentUser) {
                return res.status(404).json({ message: "User not found" });
            }
            if (currentUser.followings.includes(userToFollow._id)) {
                return res.status(400).json({ message: "Already following this user" });
            }
            currentUser.followings.push(userToFollow._id);
            userToFollow.followers.push(currentUser._id);
            yield currentUser.save();
            yield userToFollow.save();
            return res.status(200).json({ message: "User followed successfully" });
        }
        catch (error) {
            next(error);
        }
    });
}
function unfollowUserHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId, currentUserId } = user_schema_1.followUserSchema.parse(req.body);
            if (currentUserId === userId) {
                return res.status(400).json({ message: "You cannot unfollow yourself" });
            }
            const userToFollow = yield user_model_1.default.findById(userId);
            const currentUser = yield user_model_1.default.findById(currentUserId);
            if (!userToFollow || !currentUser) {
                return res.status(404).json({ message: "User not found" });
            }
            if (!currentUser.followings.includes(userToFollow._id)) {
                return res.status(400).json({ message: "You are not following this user" });
            }
            yield user_model_1.default.findByIdAndUpdate(currentUserId, { $pull: { followings: userId } });
            yield user_model_1.default.findByIdAndUpdate(userId, { $pull: { followers: currentUserId } });
            return res.status(200).json({ message: "User followed successfully" });
        }
        catch (error) {
            next(error);
        }
    });
}
function getFollowSuggestionsHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.query.userId;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 15;
            const user = yield user_model_1.default.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            const skip = (Number(page) - 1) * limit;
            const totalUsers = yield user_model_1.default.countDocuments({
                _id: { $ne: userId }, // Except yourself
                followers: { $ne: userId }, // Except users followed you
                followings: { $ne: userId }, // Except users that you followed
            });
            const totalPages = Math.ceil(totalUsers / limit);
            const suggestions = yield user_model_1.default.find({
                _id: { $ne: userId }, // Except yourself
                followers: { $ne: userId }, // Except users followed you
                followings: { $ne: userId }, // Except users that you followed
            })
                .skip(skip)
                .limit(limit)
                .select(user_model_1.USER_MODEL_HIDDEN_FIELDS);
            return res.status(200).json({ statusCode: 200, data: suggestions, totalPages, totalUsers, page, limit });
        }
        catch (error) {
            next(error);
        }
    });
}
function editProfileHandler(_req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const req = _req;
            const { bio, username } = req.body;
            const userId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString();
            if (!userId) {
                return res.status(400).json({ statusCode: 400, message: "Id is required" });
            }
            let mediaFile = null;
            if (req.file) {
                mediaFile = yield (0, cloudinary_2.uploadToCloudinary)(req.file, "avatar");
            }
            const updateValue = {};
            if (mediaFile) {
                updateValue["photo"] = mediaFile.url;
                updateValue["photoPublicId"] = mediaFile.publicId;
            }
            if (username) {
                updateValue["username"] = req.body.username;
            }
            if (bio) {
                updateValue["bio"] = bio;
            }
            if (Object.keys(updateValue).length === 0) {
                return res.status(400).json({ message: "You must change something to edit your profile" });
            }
            const user = yield user_model_1.default.findById(userId);
            // Delete old photo from cloudinary
            if (mediaFile && user && user.photoPublicId) {
                yield cloudinary_1.default.uploader.destroy(user.photoPublicId);
            }
            const updated = yield user_model_1.default.findByIdAndUpdate(userId, updateValue);
            if (!updated) {
                return res.status(404).json({ message: "User not found" });
            }
            const updatedUser = yield user_model_1.default.findById(userId).select(user_model_1.USER_MODEL_HIDDEN_FIELDS);
            return res.status(200).json({ message: "Profile updated successfully", data: updatedUser });
        }
        catch (error) {
            next(error);
        }
    });
}
// Get followings and followers of a user
function getFollowingsHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.query.userId;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 15;
            const search = req.query.search;
            if (!userId) {
                return res.status(400).json({ statusCode: 400, message: "Id is required" });
            }
            const user = yield user_model_1.default.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            const condition = { _id: { $in: user.followings } };
            if (search.trim() && search.length > 0) {
                condition["username"] = { $regex: search, $options: "i" };
            }
            const totalUsers = yield user_model_1.default.countDocuments(condition);
            const totalPages = Math.ceil(totalUsers / limit);
            const skip = (page - 1) * limit;
            const followingUsers = yield user_model_1.default.find(condition).skip(skip).limit(limit).select(user_model_1.USER_MODEL_HIDDEN_FIELDS);
            return res
                .status(200)
                .json({ message: "Get following successfully", data: followingUsers, totalUsers, totalPages, page, limit });
        }
        catch (error) {
            next(error);
        }
    });
}
function getFollowersHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.query.userId;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 15;
            const search = req.query.search;
            if (!userId) {
                return res.status(400).json({ statusCode: 400, message: "Id is required" });
            }
            const user = yield user_model_1.default.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            const condition = { _id: { $in: user.followers } };
            if (search.trim() && search.length > 0) {
                condition["username"] = { $regex: search, $options: "i" };
            }
            const totalUsers = yield user_model_1.default.countDocuments(condition);
            const totalPages = Math.ceil(totalUsers / limit);
            const skip = (page - 1) * limit;
            const followerUsers = yield user_model_1.default.find(condition).skip(skip).limit(limit).select(user_model_1.USER_MODEL_HIDDEN_FIELDS);
            return res
                .status(200)
                .json({ message: "Get followers successfully", data: followerUsers, totalUsers, totalPages, page, limit });
        }
        catch (error) {
            next(error);
        }
    });
}
//# sourceMappingURL=user.controller.js.map