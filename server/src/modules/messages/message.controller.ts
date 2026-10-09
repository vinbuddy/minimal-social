import { NextFunction, Request, Response } from "express";
import { Server } from "socket.io";
import { BadRequestError } from "../../shared/errors/app-error";
import { RequestWithUser } from "../../shared/types/request";
import {
    createMessageSchema,
    getMessagesQuerySchema,
    getMessagesWithCursorQuerySchema,
    getUsersReactedMessageQuerySchema,
} from "./message.schema";
import * as messageService from "./message.service";

function emitToRoom(req: Request, room: string, event: string, payload: unknown) {
    const io = req.app.get("io") as Server;
    io.to(room).emit(event, payload);
}

export async function createMessageHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
        // senderId in the body is ignored: the sender is always the authenticated user
        const { conversationId, content, replyTo, stickerUrl, gifUrl } = createMessageSchema.parse(req.body);

        const message = await messageService.createMessage(req.user._id, {
            conversationId,
            content,
            replyTo,
            stickerUrl,
            gifUrl,
            files: req.files as Express.Multer.File[] | undefined,
        });

        emitToRoom(req, message.conversation._id.toString(), "newMessage", message);

        return res.status(200).json({ message: "Create message successfully", data: message });
    } catch (error) {
        next(error);
    }
}

export async function getConversationMessagesHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
        const { conversationId, page, limit } = getMessagesQuerySchema.parse(req.query);

        const { messages, totalMessages, totalPages } = await messageService.getMessagesByPage(
            req.user._id,
            conversationId,
            Number(page),
            limit
        );

        return res
            .status(200)
            .json({ message: "Get messages successfully", data: messages, totalMessages, totalPages, page, limit });
    } catch (error) {
        next(error);
    }
}

// Cursor-based pagination
export async function getMessagesWithCursorHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
        const query = getMessagesWithCursorQuerySchema.parse(req.query);

        const { messages, hasNextPage, hasPrevPage } = await messageService.getMessagesByCursor(req.user._id, query);

        return res.status(200).json({ message: "Get messages successfully", data: messages, hasNextPage, hasPrevPage });
    } catch (error) {
        next(error);
    }
}

export async function reactMessageHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;

        const message = await messageService.reactToMessage(req.user._id, req.params.id, req.body.emoji);

        if (message) emitToRoom(req, message.conversation._id.toString(), "reactMessage", message);

        return res.status(200).json({ message: "React message successfully", data: message });
    } catch (error) {
        next(error);
    }
}

export async function unreactMessageHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;

        const message = await messageService.removeReaction(req.user._id, req.params.id);

        if (message) emitToRoom(req, message.conversation._id.toString(), "unreactMessage", message);

        return res.status(200).json({ message: "Unreact message successfully", data: message });
    } catch (error) {
        next(error);
    }
}

export async function getUsersReactedMessageHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
        const { emoji, messageId } = getUsersReactedMessageQuerySchema.parse(req.query);

        const message = await messageService.getUsersReactedMessage(req.user._id, messageId, emoji);

        if (!message) {
            return res.status(200).json({ message: "This message has not reacted yet", data: [] });
        }

        return res.status(200).json({ message: "Get users reacted message successfully", data: message });
    } catch (error) {
        next(error);
    }
}

export async function deleteMessageHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;

        await messageService.deleteMessageForUser(req.user._id, req.params.id);

        return res.status(200).json({ message: "Delete message successfully" });
    } catch (error) {
        next(error);
    }
}

export async function retractMessageHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;

        const message = await messageService.retractMessage(req.user._id, req.params.id);

        if (message) emitToRoom(req, message.conversation._id.toString(), "retractMessage", message);

        return res.status(200).json({ message: "Retract message successfully" });
    } catch (error) {
        next(error);
    }
}

export async function markMessageAsSeenHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
        const conversationId = req.body.conversationId as string;

        const lastMessage = await messageService.markConversationAsSeen(req.user._id, conversationId);

        emitToRoom(req, conversationId, "markMessageAsSeen", lastMessage);

        return res.status(200).json({ message: "Mark message as seen successfully" });
    } catch (error) {
        next(error);
    }
}

export async function searchMessagesHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
        const { search, conversationId } = req.query;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        if (typeof search !== "string" || !search || typeof conversationId !== "string" || !conversationId) {
            throw new BadRequestError("Search query is required");
        }

        const { messages, totalMessages, totalPages } = await messageService.searchMessages(
            req.user._id,
            conversationId,
            search,
            page,
            limit
        );

        return res.status(200).json({
            message: "Search messages successfully",
            data: messages,
            totalMessages,
            totalPages,
            page,
            limit,
        });
    } catch (error) {
        next(error);
    }
}
