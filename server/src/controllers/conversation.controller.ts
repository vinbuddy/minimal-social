import { NextFunction, Request, Response } from "express";
import ConversationModel from "../models/conversation.model";
import { USER_MODEL_HIDDEN_FIELDS } from "../models/user.model";

export async function getConversationsHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.params.userId;

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
            .sort({ createdAt: -1 })
            .populate({
                path: "participants",
                select: USER_MODEL_HIDDEN_FIELDS,
            });

        return res.status(200).json({
            message: "Get conversations successfully",
            data: conversations,
            totalConversations,
            totalPages,
            page,
            limit,
        });
    } catch (error) {
        next(error);
    }
}
