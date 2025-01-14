import { NextFunction, Request, Response } from "express";
import { CreateCommentInput, createCommentSchema } from "../schemas/comment.schema";
import { extractMentionsAndTags, replaceHrefs } from "../helpers/text-parser";
import UserModel, { USER_MODEL_HIDDEN_FIELDS } from "../models/user.model";
import mongoose from "mongoose";
import CommentModel from "../models/comment.model";

export async function createCommentHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { commentBy, content, rootComment, replyTo, target, targetType } = createCommentSchema.parse(
            req.body
        ) as CreateCommentInput;

        const { mentions: mentionUsernames, tags } = extractMentionsAndTags(content);

        const formatContent = await replaceHrefs(content);

        // Extract mention to userId
        const mentionUserIds: any = [];
        const userInMentions = await UserModel.find({
            username: { $in: mentionUsernames },
        });

        userInMentions.forEach((user) => {
            const userId = new mongoose.Types.ObjectId(user._id);
            mentionUserIds.push(userId);
        });

        const comment = await CommentModel.create({
            targetType: targetType ?? "Post",
            target: new mongoose.Types.ObjectId(target),
            commentBy: new mongoose.Types.ObjectId(commentBy),
            rootComment: rootComment ? new mongoose.Types.ObjectId(rootComment) : null,
            replyTo: replyTo ? new mongoose.Types.ObjectId(replyTo) : null,
            content: formatContent,
            mentions: mentionUserIds,
            tags,
        });

        await CommentModel.populate(comment, [{ path: "commentBy", select: USER_MODEL_HIDDEN_FIELDS }]);

        return res.json({
            message: "Create comment successfully",
            data: comment,
        });
    } catch (error) {
        next(error);
    }
}

export async function getCommentsByTargetHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const targetType = req.query.targetType as string;
        const target = req.query.target as string;

        const page = Number(req.query.page) ?? 1;
        const limit = Number(req.query.limit) ?? 15;

        const skip = (Number(page) - 1) * limit;
        const totalComments = await CommentModel.countDocuments({ target: target });
        const totalPages = Math.ceil(totalComments / limit);

        const comments = await CommentModel.aggregate([
            { $match: { target: new mongoose.Types.ObjectId(target), targetType: targetType, replyTo: null } },
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
    } catch (error) {
        next(error);
    }
}

export async function getRepliesHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const rootComment = req.query.rootComment as string;

        const page = Number(req.query.page) ?? 1;
        const limit = Number(req.query.limit) ?? 15;

        const skip = (Number(page) - 1) * limit;
        const totalComments = await CommentModel.countDocuments({ rootComment: rootComment });
        const totalPages = Math.ceil(totalComments / limit);

        const replies = await CommentModel.aggregate([
            { $match: { rootComment: new mongoose.Types.ObjectId(rootComment) } },
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
    } catch (error) {
        next(error);
    }
}

export async function likeCommentHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { commentId, userId } = req.body;

        if (!commentId || !userId) {
            return res.status(400).json({
                message: "commentId or userId is required",
            });
        }

        const updatedComment = await CommentModel.findByIdAndUpdate(commentId, {
            $push: { likes: userId },
        });

        if (!updatedComment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const comment = await CommentModel.populate(updatedComment, [
            { path: "commentBy", select: USER_MODEL_HIDDEN_FIELDS },
            { path: "mentions", select: USER_MODEL_HIDDEN_FIELDS },
        ]);

        return res.status(200).json({ message: "Comment liked successfully", data: comment });
    } catch (error) {
        next(error);
    }
}

export async function unlikeCommentHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { commentId, userId } = req.body;

        if (!commentId || !userId) {
            return res.status(400).json({
                message: "commentId or userId is required",
            });
        }

        const updatedComment = await CommentModel.findByIdAndUpdate(commentId, {
            $pull: { likes: userId },
        });

        if (!updatedComment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const comment = await CommentModel.populate(updatedComment, [
            { path: "commentBy", select: USER_MODEL_HIDDEN_FIELDS },
            { path: "mentions", select: USER_MODEL_HIDDEN_FIELDS },
        ]);

        return res.status(200).json({ message: "Comment unliked successfully", data: comment });
    } catch (error) {
        next(error);
    }
}

export async function deleteCommentHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const commentId = req.params.id;

        if (!commentId) {
            return res.status(400).json({
                message: "commentId is required",
            });
        }

        const comment = await CommentModel.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const isRootComment = comment.replyTo == null;

        if (isRootComment) {
            // Delete all replies of root comment
            await CommentModel.deleteMany({ rootComment: new mongoose.Types.ObjectId(commentId) });
        }

        await CommentModel.findByIdAndDelete(commentId);

        return res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        next(error);
    }
}
