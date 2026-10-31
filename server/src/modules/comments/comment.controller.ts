import { NextFunction, Request, Response } from "express";
import { CreateCommentInput, createCommentSchema } from "./comment.schema";
import { extractMentionsAndTags, replaceHrefs } from "../../shared/helpers/text-parser";
import UserModel, { USER_MODEL_HIDDEN_FIELDS } from "../users/user.model";
import { BlockModel } from "../users/block.model";
import mongoose from "mongoose";
import CommentModel from "./comment.model";
import PostModel from "../posts/post.model";
import ReelModel from "../reels/reel.model";
import { incrementCommentCount } from "../reels/reel.service";
import { RequestWithUser } from "../../shared/types/request";

export async function createCommentHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
        const { content, rootComment, replyTo, target, targetType } = createCommentSchema.parse(
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

        if (targetType === "Reel" && !(await ReelModel.exists({ _id: target }))) {
            return res.status(404).json({ message: "Reel not found" });
        }

        const comment = await CommentModel.create({
            targetType: targetType,
            target: new mongoose.Types.ObjectId(target),
            commentBy: new mongoose.Types.ObjectId(req.user._id),
            rootComment: rootComment ? new mongoose.Types.ObjectId(rootComment) : null,
            replyTo: replyTo ? new mongoose.Types.ObjectId(replyTo) : null,
            content: formatContent,
            mentions: mentionUserIds,
            tags,
        });

        await CommentModel.populate(comment, [{ path: "commentBy", select: USER_MODEL_HIDDEN_FIELDS }]);

        if (targetType === "Reel") await incrementCommentCount(target, 1);

        return res.json({
            message: "Create comment successfully",
            data: comment,
        });
    } catch (error) {
        next(error);
    }
}

export async function getCommentsByTargetHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
        const targetType = req.query.targetType as string;
        const target = req.query.target as string;

        const page = Number(req.query.page) ?? 1;
        const limit = Number(req.query.limit) ?? 15;

        // Me: Blocked some users
        const currentUserId = req.user._id?.toString();
        const blocksByMe = await BlockModel.find({ blocker: currentUserId }).select("blocked");
        const blockedUsers = blocksByMe.map(b => b.blocked);

        // Users: Blocked me
        const blocksAgainstMe = await BlockModel.find({ blocked: currentUserId }).select("blocker");
        const blockedByUsers = blocksAgainstMe.map(b => b.blocker);

        const condition = {
            target: new mongoose.Types.ObjectId(target),
            targetType: targetType,
            replyTo: null,
            $or: [
                { commentBy: new mongoose.Types.ObjectId(currentUserId) }, // Include my posts
                { commentBy: { $nin: [...blockedUsers, ...blockedByUsers] } }, // Exclude posts from both blocked and blocking users
            ],
        };

        const skip = (Number(page) - 1) * limit;
        const totalComments = await CommentModel.countDocuments(condition);
        const totalPages = Math.ceil(totalComments / limit);

        const comments = await CommentModel.aggregate([
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
    } catch (error) {
        next(error);
    }
}

/** One comment in the list shape (author, mentions, counts): lets a notification link open that exact comment */
export async function getCommentByIdHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
        const commentId = req.params.id;

        if (!mongoose.isValidObjectId(commentId)) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const [comment] = await CommentModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(commentId) } },
            { $lookup: { from: "users", localField: "commentBy", foreignField: "_id", as: "commentBy" } },
            { $unwind: "$commentBy" },
            { $lookup: { from: "users", localField: "mentions", foreignField: "_id", as: "mentions" } },
            {
                $lookup: {
                    from: "comments",
                    let: { commentId: "$_id" },
                    pipeline: [{ $match: { $expr: { $eq: ["$rootComment", "$$commentId"] } } }, { $count: "count" }],
                    as: "replyStats",
                },
            },
            {
                $addFields: {
                    replyCount: { $ifNull: [{ $arrayElemAt: ["$replyStats.count", 0] }, 0] },
                    likeCount: { $size: "$likes" },
                },
            },
            {
                $project: {
                    "commentBy.password": 0,
                    "commentBy.refreshToken": 0,
                    "commentBy.__v": 0,
                    "mentions.password": 0,
                    "mentions.refreshToken": 0,
                    "mentions.__v": 0,
                    replyStats: 0,
                },
            },
        ]);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const blocked = await BlockModel.exists({
            $or: [
                { blocker: req.user._id, blocked: comment.commentBy._id },
                { blocker: comment.commentBy._id, blocked: req.user._id },
            ],
        });

        if (blocked) {
            return res.status(404).json({ message: "Comment not found" });
        }

        return res.json({ message: "Get comment successfully", data: comment });
    } catch (error) {
        next(error);
    }
}

export async function getRepliesHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
        const rootComment = req.query.rootComment as string;

        const page = Number(req.query.page) ?? 1;
        const limit = Number(req.query.limit) ?? 15;

        // Me: Blocked some users
        const currentUserId = req.user._id?.toString();
        const blocksByMe = await BlockModel.find({ blocker: currentUserId }).select("blocked");
        const blockedUsers = blocksByMe.map(b => b.blocked);

        // Users: Blocked me
        const blocksAgainstMe = await BlockModel.find({ blocked: currentUserId }).select("blocker");
        const blockedByUsers = blocksAgainstMe.map(b => b.blocker);

        const condition = {
            rootComment: new mongoose.Types.ObjectId(rootComment),
            $or: [
                { commentBy: new mongoose.Types.ObjectId(currentUserId) }, // Include my posts
                { commentBy: { $nin: [...blockedUsers, ...blockedByUsers] } }, // Exclude posts from both blocked and blocking users
            ],
        };

        const skip = (Number(page) - 1) * limit;
        const totalComments = await CommentModel.countDocuments(condition);
        const totalPages = Math.ceil(totalComments / limit);

        const replies = await CommentModel.aggregate([
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
    } catch (error) {
        next(error);
    }
}

export async function likeCommentHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
        const { commentId } = req.body;

        if (!commentId) {
            return res.status(400).json({ message: "commentId is required" });
        }

        const updatedComment = await CommentModel.findByIdAndUpdate(
            commentId,
            { $addToSet: { likes: new mongoose.Types.ObjectId(req.user._id) } },
            { new: true }
        );

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

export async function unlikeCommentHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
        const { commentId } = req.body;

        if (!commentId) {
            return res.status(400).json({ message: "commentId is required" });
        }

        const updatedComment = await CommentModel.findByIdAndUpdate(
            commentId,
            { $pull: { likes: new mongoose.Types.ObjectId(req.user._id) } },
            { new: true }
        );

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

export async function deleteCommentHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
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

        // Only the comment author, the author of the commented post, or an admin can delete it
        const userId = req.user._id.toString();
        const isCommentAuthor = comment.commentBy.toString() === userId;
        const isPostAuthor =
            comment.targetType === "Post" && (await PostModel.exists({ _id: comment.target, postBy: userId })) !== null;
        const isReelAuthor =
            comment.targetType === "Reel" && (await ReelModel.exists({ _id: comment.target, reelBy: userId })) !== null;

        if (!isCommentAuthor && !isPostAuthor && !isReelAuthor && !req.user.isAdmin) {
            return res.status(403).json({ message: "You are not allowed to delete this comment" });
        }

        const isRootComment = comment.replyTo == null;
        let deletedReplies = 0;

        if (isRootComment) {
            // Delete all replies of root comment
            const { deletedCount } = await CommentModel.deleteMany({
                rootComment: new mongoose.Types.ObjectId(commentId),
            });
            deletedReplies = deletedCount;
        }

        await CommentModel.findByIdAndDelete(commentId);

        if (comment.targetType === "Reel") await incrementCommentCount(String(comment.target),-(deletedReplies + 1));

        return res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        next(error);
    }
}
