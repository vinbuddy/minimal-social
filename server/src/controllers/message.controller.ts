import { NextFunction, Request, Response } from "express";
import { USER_MODEL_HIDDEN_FIELDS } from "../models/user.model";
import mongoose from "mongoose";
import { createMessageSchema } from "../schemas/message.schema";
import ConversationModel, { LastMessage } from "../models/conversation.model";
import { MediaFile } from "../models/post.model";
import { uploadToCloudinary } from "../helpers/cloudinary";
import MessageModel from "../models/message.model";

interface RequestWithFiles extends Request {
    files: Express.Multer.File[];
}

export async function createMessageHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithFiles;
        const { senderId, conversationId, content, replyTo } = createMessageSchema.parse(req.body);
        const files = req.files as Express.Multer.File[];

        let conversation = await ConversationModel.findOne({
            _id: new mongoose.Types.ObjectId(conversationId),
        });

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        // Create the message
        let uploadedFiles: MediaFile[] = [];
        if (files && files.length > 0) {
            const uploadPromises = files.map((file) => {
                let uploadPromise = uploadToCloudinary(file, "messages");
                return uploadPromise;
            });
            uploadedFiles = await Promise.all(uploadPromises);
        }

        const newMessage = await MessageModel.create({
            sender: new mongoose.Types.ObjectId(senderId),
            conversation: conversation._id,
            content: content ?? null,
            replyTo: replyTo ? new mongoose.Types.ObjectId(replyTo) : null,
            mediaFiles: uploadedFiles || [],
        });

        const message = await MessageModel.populate(newMessage, [
            { path: "sender", select: USER_MODEL_HIDDEN_FIELDS },
            {
                path: "conversation",
                populate: {
                    path: "participants",
                    select: USER_MODEL_HIDDEN_FIELDS,
                },
            },
        ]);

        // Update last message of the conversation
        let lastMessageContent = message.content ?? "Sent message";

        if (!content && uploadedFiles.length > 0) {
            lastMessageContent = "Sent photo";
        }

        const lastMessage: LastMessage = {
            sender: message.sender._id,
            content: lastMessageContent,
            createdAt: message._id.getTimestamp(),
        };

        conversation.lastMessage = lastMessage;
        await conversation.save();

        return res.status(200).json({ message: "Create message successfully", data: message });
    } catch (error) {
        next(error);
    }
}

export async function getConversationMessagesHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const conversationId = req.query.conversationId as string;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        if (!conversationId) return res.status(400).json({ message: "Conversation ID is required" });

        const condition = {
            conversation: new mongoose.Types.ObjectId(conversationId),
        };

        const skip = (Number(page) - 1) * limit;
        const totalMessages = await MessageModel.countDocuments(condition);
        const totalPages = Math.ceil(totalMessages / limit);

        const messages = await MessageModel.find(condition)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate({
                path: "sender",
                select: USER_MODEL_HIDDEN_FIELDS,
            })
            .populate({
                path: "replyTo",
            });

        return res
            .status(200)
            .json({ message: "Get messages successfully", data: messages, totalMessages, totalPages, page, limit });
    } catch (error) {
        next(error);
    }
}
