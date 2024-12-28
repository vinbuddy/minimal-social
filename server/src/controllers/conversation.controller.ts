import { NextFunction, Request, Response } from "express";
import ConversationModel from "../models/conversation.model";
import UserModel, { USER_MODEL_HIDDEN_FIELDS } from "../models/user.model";
import mongoose from "mongoose";
import MessageModel from "../models/message.model";
import { RequestWithUser } from "../helpers/types/request";

export async function createPrivateConversationHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const participants = req.body.participants as string[];

        const participantIds = participants.map((participant) => new mongoose.Types.ObjectId(participant));

        // Check if the conversation already existvs
        const conversation = await ConversationModel.findOne({
            isGroup: false,
            participants: {
                $all: participantIds,
            },
        }).populate({ path: "participants.user", select: USER_MODEL_HIDDEN_FIELDS });

        if (conversation) {
            return res.status(200).json({
                message: "Conversation already exists",
                data: conversation,
            });
        }

        // Create a new conversation
        const createdConversation = await ConversationModel.create({
            participants: participantIds,
        });

        const newConversation = await ConversationModel.populate(createdConversation, {
            path: "participants",
            select: USER_MODEL_HIDDEN_FIELDS,
        });

        return res.status(201).json({
            message: "Create conversation successfully",
            data: newConversation,
        });
    } catch (error) {
        next(error);
    }
}

export async function getConversationsHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        // const userId = req.query.userId;
        const req = _req as RequestWithUser;
        const userId = req.user._id?.toString();

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 15;

        const condition = {
            participants: {
                $in: [userId],
            },
        };

        const skip = (Number(page) - 1) * limit;
        const totalConversations = await ConversationModel.countDocuments(condition);
        const totalPages = Math.ceil(totalConversations / limit);

        // Get all conversations of the user
        const conversations = await ConversationModel.find(condition)
            .skip(skip)
            .limit(limit)
            .sort({ updatedAt: -1 })
            .populate({
                path: "participants",
                select: USER_MODEL_HIDDEN_FIELDS,
            })
            .lean();

        const conversationWithUnreadCount = await Promise.all(
            conversations.map(async (conversation) => {
                const unreadCount = await MessageModel.countDocuments({
                    conversation: conversation._id,
                    seenBy: { $nin: [new mongoose.Types.ObjectId(userId)] },
                });

                return {
                    ...conversation,
                    unreadCount,
                };
            })
        );

        return res.status(200).json({
            message: "Get conversations successfully",
            data: conversationWithUnreadCount,
            totalConversations,
            totalPages,
            page,
            limit,
        });
    } catch (error) {
        next(error);
    }
}

export async function searchConversationsByNameHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
        // Find conversation by name or username
        const search = req.query.search;
        // const userId = req.query.userId as string;
        const userId = req.user._id?.toString();

        if (!search) {
            return res.status(400).json({ error: "Search name is required" });
        }

        const users = await UserModel.find({ username: { $regex: search, $options: "i" } })
            .limit(10)
            .select(USER_MODEL_HIDDEN_FIELDS)
            .lean();

        if (users.length === 0) {
            return res.status(200).json({
                message: "No users found with the given search term",
                data: [],
            });
        }
        // const userIds = users.map((user) => user._id);
        const currentUserId = new mongoose.Types.ObjectId(userId);

        const conversationPromises = users.map(async (user) => {
            const conversation = await ConversationModel.findOne({
                isGroup: false,
                participants: {
                    $all: [currentUserId, user._id],
                },
                $expr: {
                    $eq: [{ $size: "$participants" }, 2],
                },
            }).populate({ path: "participants", select: USER_MODEL_HIDDEN_FIELDS });

            return {
                conversation: conversation ?? null,
                user: user,
            };
        });
        const privateConversations = await Promise.all(conversationPromises);

        // Get group conversations
        const groupConversations = await ConversationModel.find({
            isGroup: true,
            "groupInfo.name": { $regex: search, $options: "i" },
        }).populate({ path: "participants", select: USER_MODEL_HIDDEN_FIELDS });

        return res.status(200).json({
            message: "Search successfully",
            data: {
                privateConversations,
                groupConversations,
            },
        });
    } catch (error) {
        next(error);
    }
}

export async function getConversationDetailHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const conversationId = req.params.id;

        const conversation = await ConversationModel.findById(conversationId).populate({
            path: "participants",
            select: USER_MODEL_HIDDEN_FIELDS,
        });

        if (!conversation) {
            return res.status(404).json({
                message: "Conversation not found",
            });
        }

        return res.status(200).json({
            message: "Get conversation detail successfully",
            data: conversation,
        });
    } catch (error) {
        next(error);
    }
}

export async function getConversationMediaFilesHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const conversationId = req.query.conversationId as string;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        if (!conversationId) return res.status(400).json({ message: "Conversation ID is required" });

        const skip = (Number(page) - 1) * limit;

        const condition = {
            mediaFiles: { $ne: [] },
            conversation: new mongoose.Types.ObjectId(conversationId),
        };

        const messagesWithMediaFile = await MessageModel.find(condition)
            .select("mediaFiles createdAt")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();

        const totalMediaFiles = await MessageModel.countDocuments(condition);
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
    } catch (error) {
        next(error);
    }
}

export async function changeConversationEmojiHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const conversationId = req.params.id;
        const emoji = req.body.emoji;

        const conversation = await ConversationModel.findByIdAndUpdate(conversationId, {
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
    } catch (error) {
        next(error);
    }
}
