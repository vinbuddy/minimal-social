import { NextFunction, Request, Response } from "express";
import PostModel, { MediaFile } from "../models/post.model";
import { extractMentionsAndTags, replaceHrefs } from "../helpers/textParser";
import UserModel, { USER_MODEL_HIDDEN_FIELDS } from "../models/user.model";
import mongoose from "mongoose";
import { createPostInput, createPostSchema, editPostInput, editPostSchema } from "../schemas/post.schema";
import { uploadToCloudinary } from "../helpers/cloudinary";
import cloudinary from "../configs/cloudinary";
import CommentModel from "../models/comment";

interface RequestWithFiles extends Request {
    files: Express.Multer.File[];
}

export async function createPostHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithFiles;
        const { postBy, caption } = createPostSchema.parse(req.body) as createPostInput;

        const files = req.files as Express.Multer.File[];

        let uploadedFiles: MediaFile[] = [];
        if (files && files.length > 0) {
            const uploadPromises = files.map((file) => {
                let uploadPromise = uploadToCloudinary(file, "posts");
                return uploadPromise;
            });
            uploadedFiles = await Promise.all(uploadPromises);
        }

        const { mentions: mentionUsernames, tags } = extractMentionsAndTags(caption);

        const formatCaption = await replaceHrefs(caption);

        const mentionUserIds: any = [];
        const userInMentions = await UserModel.find({
            username: { $in: mentionUsernames },
        });
        userInMentions.forEach((user) => {
            const userId = new mongoose.Types.ObjectId(user._id);
            mentionUserIds.push(userId);
        });

        const newPost = await PostModel.create({
            postBy: new mongoose.Types.ObjectId(postBy),
            caption: formatCaption,
            mentions: mentionUserIds,
            tags,
            mediaFiles: (uploadedFiles as MediaFile[]) ?? [],
        });

        await newPost.save();

        const post = await PostModel.populate(newPost, [
            { path: "postBy", select: USER_MODEL_HIDDEN_FIELDS },
            { path: "mentions", select: USER_MODEL_HIDDEN_FIELDS },
        ]);

        return res.status(200).json({ message: "Create post successfully", data: post });
    } catch (error) {
        next(error);
    }
}

export async function editPostHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { caption, postId } = editPostSchema.parse(req.body) as editPostInput;

        const { mentions: mentionUsernames, tags } = extractMentionsAndTags(caption);

        const formatCaption = await replaceHrefs(caption);

        const mentionUserIds: any = [];
        const userInMentions = await UserModel.find({
            username: { $in: mentionUsernames },
        });
        userInMentions.forEach((user) => {
            const userId = new mongoose.Types.ObjectId(user._id);
            mentionUserIds.push(userId);
        });

        const updatedPost = await PostModel.findByIdAndUpdate(postId, {
            caption: formatCaption,
            mentions: mentionUserIds,
            tags,
            isEdited: true,
        });

        if (!updatedPost) {
            return res.status(404).json({ message: "Post not found" });
        }

        const post = await PostModel.populate(updatedPost, [
            { path: "postBy", select: USER_MODEL_HIDDEN_FIELDS },
            { path: "mentions", select: USER_MODEL_HIDDEN_FIELDS },
        ]);

        return res.status(200).json({ message: "Edit post successfully", data: post });
    } catch (error) {
        next(error);
    }
}

export async function deletePostHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({ message: "Post ID is required" });
        }

        const post = await PostModel.findById(id);

        const mediaFiles: MediaFile[] | null = post && post.mediaFiles;

        if (mediaFiles && mediaFiles.length > 0) {
            const promises = mediaFiles.map((file) => cloudinary.uploader.destroy(file.publicId));
            await Promise.all(promises);
        }

        await PostModel.findByIdAndDelete(id);
        await CommentModel.deleteMany({ target: new mongoose.Types.ObjectId(id) });

        return res.status(200).json({ message: "Delete post successfully" });
    } catch (error) {}
}

export async function getAllPostsHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const page = Number(req.query.page) ?? 1;
        const limit = Number(req.query.limit) ?? 15;

        const skip = (Number(page) - 1) * limit;
        const totalPosts = await PostModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / limit);

        const posts = await PostModel.aggregate([
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
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

        return res
            .status(200)
            .json({ message: "Get all posts successfully", data: posts, totalPosts, totalPages, page, limit });
    } catch (error) {
        next(error);
    }
}

export async function getFollowingPostsHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.query.userId;
        const page = Number(req.query.page) ?? 1;
        const limit = Number(req.query.limit) ?? 15;

        const skip = (Number(page) - 1) * limit;

        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const followingIds = user?.followings ?? [];

        const totalPosts = await PostModel.countDocuments({
            postBy: { $in: followingIds }, // Get following posts
        });
        const totalPages = Math.ceil(totalPosts / limit);

        const posts = await PostModel.aggregate([
            { $match: { postBy: { $in: followingIds } } },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
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

        return res
            .status(200)
            .json({ message: "Get following posts successfully", data: posts, totalPosts, totalPages, page, limit });
    } catch (error) {
        next(error);
    }
}

export async function getPostDetailHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const postId = req.params.id;

        if (!postId) {
            return res.status(400).json({ message: "Post ID is required" });
        }

        const post = await PostModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(postId) } },
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
    } catch (error) {
        next(error);
    }
}

export async function getLikedPostsHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.query.userId as string;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 15;

        const skip = (page - 1) * limit;

        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const totalPosts = await PostModel.countDocuments({
            likes: { $in: [userId] },
        });
        const totalPages = Math.ceil(totalPosts / limit);

        const posts = await PostModel.aggregate([
            { $match: { likes: { $in: [new mongoose.Types.ObjectId(userId)] } } },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: "users",
                    localField: "postBy",
                    foreignField: "_id",
                    as: "postBy",
                },
            },
            { $unwind: "$postBy" },
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
                    "postBy.password": 0,
                    "postBy.refreshToken": 0,
                    "postBy.__v": 0,
                    "mentions.password": 0,
                    "mentions.refreshToken": 0,
                    "mentions.__v": 0,
                    comments: 0,
                },
            },
        ]);

        return res
            .status(200)
            .json({ message: "Get following posts successfully", data: posts, totalPosts, totalPages, page, limit });
    } catch (error) {
        next(error);
    }
}

export async function likePostHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { postId, userId } = req.body;

        const updatedPost = await PostModel.findByIdAndUpdate(postId, {
            $push: { likes: userId },
        });

        if (!updatedPost) {
            return res.status(404).json({ message: "Post not found" });
        }

        const post = await PostModel.populate(updatedPost, [
            { path: "postBy", select: USER_MODEL_HIDDEN_FIELDS },
            { path: "mentions", select: USER_MODEL_HIDDEN_FIELDS },
        ]);

        return res.status(200).json({ message: "Post liked successfully", data: post });
    } catch (error) {
        next(error);
    }
}

export async function unlikePostHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { postId, userId } = req.body;

        const updatedPost = await PostModel.findByIdAndUpdate(postId, {
            $pull: { likes: userId },
        });

        if (!updatedPost) {
            return res.status(404).json({ message: "Post not found" });
        }

        const post = await PostModel.populate(updatedPost, [
            { path: "postBy", select: USER_MODEL_HIDDEN_FIELDS },
            { path: "mentions", select: USER_MODEL_HIDDEN_FIELDS },
        ]);

        return res.status(200).json({ message: "Post unliked successfully", data: post });
    } catch (error) {
        next(error);
    }
}
