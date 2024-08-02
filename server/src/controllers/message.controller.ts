import { NextFunction, Request, Response } from "express";
import { USER_MODEL_HIDDEN_FIELDS } from "../models/user.model";
import mongoose from "mongoose";
import { createMessageSchema } from "../schemas/message.schema";
import ConversationModel from "../models/conversation.model";
import { MediaFile } from "../models/post.model";
import { uploadToCloudinary } from "../helpers/cloudinary";
import MessageModel from "../models/message.model";

interface RequestWithFiles extends Request {
    files: Express.Multer.File[];
}

export async function createMessageHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithFiles;
        const { sender, receiver, conversationId, content, replyTo } = createMessageSchema.parse(req.body);
        const files = req.files as Express.Multer.File[];

        let conversation = await ConversationModel.findOne({
            _id: new mongoose.Types.ObjectId(conversationId),
            participants: {
                $in: [sender, receiver],
            },
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
            sender: new mongoose.Types.ObjectId(sender),
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

        return res.status(200).json({ message: "Create message successfully", data: message });
    } catch (error) {
        next(error);
    }
}

export async function getConversationMessagesHandler(req: Request, res: Response, next: NextFunction) {
    try {
    } catch (error) {
        next(error);
    }
}
