import { NextFunction, Request, Response } from "express";
import UserModel, { USER_MODEL_HIDDEN_FIELDS } from "../models/user.model";
import mongoose from "mongoose";
import { createMessageSchema } from "../schemas/message.schema";
import ConversationModel, { LastMessage } from "../models/conversation.model";
import { MediaFile } from "../models/post.model";
import { uploadToCloudinary } from "../helpers/cloudinary";
import MessageModel from "../models/message.model";
import { Server } from "socket.io";

interface RequestWithFiles extends Request {
    files: Express.Multer.File[];
}

enum E_EMOJI {
    HEART = "❤️",
    HAHA = "😆",
    WOW = "😮",
    SAD = "😢",
    ANGRY = "😡",
}

export async function createMessageHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithFiles;
        const { senderId, conversationId, content, replyTo, stickerUrl, gifUrl } = createMessageSchema.parse(req.body);
        const files = req.files as Express.Multer.File[];

        let conversation = await ConversationModel.findOne({
            _id: new mongoose.Types.ObjectId(conversationId),
        });

        if (!conversation || !conversationId) {
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
            stickerUrl: stickerUrl ?? null,
            gifUrl: gifUrl ?? null,
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
            {
                path: "replyTo",
            },
        ]);

        let lastMessageContent = "Sent message";

        if (message.content) {
            lastMessageContent = message.content;
        } else if (stickerUrl) {
            lastMessageContent = "Sent sticker";
        } else if (gifUrl) {
            lastMessageContent = "Sent gif";
        } else if (uploadedFiles.length > 0) {
            lastMessageContent = "Sent photo";
        }

        const lastMessage: LastMessage = {
            sender: message.sender._id,
            content: lastMessageContent,
            createdAt: message._id.getTimestamp(),
        };

        conversation.lastMessage = lastMessage;
        await conversation.save();

        // Send real time message in room
        const io = req.app.get("io") as Server;

        io.to(conversationId).emit("newMessage", message);

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
            })
            .populate({
                path: "conversation",
            })
            .populate({
                path: "reactions.user",
            });

        return res
            .status(200)
            .json({ message: "Get messages successfully", data: messages, totalMessages, totalPages, page, limit });
    } catch (error) {
        next(error);
    }
}

export async function reactMessageHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, emoji, conversationId } = req.body;
        const messageId = req.params.id;

        const message = await MessageModel.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        const reactionIndex = message.reactions.findIndex((reaction) => reaction.user.toString() === userId);

        if (reactionIndex === -1) {
            message.reactions.push({ user: new mongoose.Types.ObjectId(userId), emoji });
            await message.save();
        } else {
            await MessageModel.updateOne(
                {
                    _id: message._id,
                    "reactions.user": new mongoose.Types.ObjectId(userId),
                },
                {
                    $set: {
                        "reactions.$.emoji": emoji,
                    },
                }
            );
        }

        const updatedMessage = await MessageModel.findById(message._id)
            .populate({
                path: "sender",
                select: USER_MODEL_HIDDEN_FIELDS,
            })
            .populate({
                path: "replyTo",
            })
            .populate({
                path: "conversation",
            })
            .populate({
                path: "reactions.user",
            });

        const io = req.app.get("io") as Server;

        io.to(conversationId).emit("reactMessage", updatedMessage);

        return res.status(200).json({ message: "React message successfully", data: updatedMessage });
    } catch (error) {
        next(error);
    }
}

export async function unreactMessageHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, conversationId } = req.body;
        const messageId = req.params.id;

        const message = await MessageModel.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        const reactionIndex = message.reactions.findIndex((reaction) => reaction.user.toString() === userId);

        if (reactionIndex !== -1) {
            message.reactions.splice(reactionIndex, 1);
            await message.save();
        }

        const updatedMessage = await MessageModel.findOne({ _id: new mongoose.Types.ObjectId(messageId) })
            .populate({ path: "sender", select: USER_MODEL_HIDDEN_FIELDS })
            .populate({ path: "replyTo" })
            .populate({ path: "conversation" })
            .populate({ path: "reactions.user", select: USER_MODEL_HIDDEN_FIELDS });

        const io = req.app.get("io") as Server;

        io.to(conversationId).emit("unreactMessage", updatedMessage);

        return res.status(200).json({ message: "Unreact message successfully", data: updatedMessage });
    } catch (error) {
        next(error);
    }
}

function getEmojiFromClientInput(clientInput: string): string {
    const uppercasedInput = clientInput.toUpperCase() as keyof typeof E_EMOJI;

    if (uppercasedInput in E_EMOJI) {
        return E_EMOJI[uppercasedInput];
    }

    throw new Error(`Emoji with key "${clientInput}" not found`);
}

export async function getUsersReactedMessageHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { emoji, messageId } = req.query;
        if (!emoji || !messageId) {
            return res.status(400).json({ message: "Emoji is required" });
        }

        let emojiIcon;
        try {
            emojiIcon = getEmojiFromClientInput(emoji as string); // Ex: convert 'heart' to '❤️'
        } catch (error) {
            return res.status(400).json({ message: "Invalid emoji" });
        }

        const message = await MessageModel.findOne({
            _id: new mongoose.Types.ObjectId(messageId as string),
            reactions: { $elemMatch: { emoji: emojiIcon } },
        }).lean();

        if (!message) {
            return res.status(200).json({ message: "This message has not reacted yet", data: [] });
        }

        const filteredReactions = message.reactions.filter((reaction) => reaction.emoji === emojiIcon);

        const populatedReactions = await Promise.all(
            filteredReactions.map(async (reaction) => {
                if (reaction.user) {
                    const populatedUser = await UserModel.findById(reaction.user)
                        .select(USER_MODEL_HIDDEN_FIELDS)
                        .lean();
                    return { ...reaction, user: populatedUser };
                }
                return reaction;
            })
        );

        const populatedMessage = { ...message, reactions: populatedReactions };

        return res.status(200).json({ message: "Get users reacted message successfully", data: populatedMessage });
    } catch (error) {
        next(error);
    }
}
