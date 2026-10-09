import mongoose, { PopulateOptions } from "mongoose";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../shared/errors/app-error";
import { uploadToCloudinary } from "../../shared/helpers/cloudinary";
import { escapeRegex } from "../../shared/helpers/regex";
import { USER_MODEL_HIDDEN_FIELDS } from "../users/user.model";
import { MediaFile } from "../posts/post.model";
import ConversationModel, { LastMessage } from "./conversation.model";
import MessageModel, { Message } from "./message.model";

const { ObjectId } = mongoose.Types;

type Id = string | mongoose.Types.ObjectId;

enum E_EMOJI {
    HEART = "❤️",
    HAHA = "😆",
    WOW = "😮",
    SAD = "😢",
    ANGRY = "😡",
}

/** Every message returned to clients (HTTP or socket) is populated the same way */
const MESSAGE_POPULATE: PopulateOptions[] = [
    { path: "sender", select: USER_MODEL_HIDDEN_FIELDS },
    { path: "seenBy", select: USER_MODEL_HIDDEN_FIELDS },
    { path: "replyTo" },
    { path: "conversation", populate: { path: "participants", select: USER_MODEL_HIDDEN_FIELDS } },
    { path: "reactions.user", select: USER_MODEL_HIDDEN_FIELDS },
];

function findPopulatedMessage(messageId: Id) {
    return MessageModel.findById(messageId).populate(MESSAGE_POPULATE);
}

/** Messages of a conversation that the user hasn't deleted for themselves */
function visibleMessagesCondition(conversationId: Id, userId: Id) {
    return {
        conversation: new ObjectId(conversationId),
        excludedFor: { $nin: [new ObjectId(userId)] },
    };
}

/** Load a conversation and make sure the user is one of its participants */
export async function getConversationForMember(conversationId: Id | undefined, userId: Id) {
    if (!conversationId || !mongoose.isValidObjectId(conversationId)) {
        throw new NotFoundError("Conversation not found");
    }

    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation) throw new NotFoundError("Conversation not found");

    const isMember = conversation.participants.some((participant) => participant._id.toString() === userId.toString());
    if (!isMember) throw new ForbiddenError("You are not a member of this conversation");

    return conversation;
}

/** Load a message the user can act on (they must be a participant of its conversation) */
async function getMessageForMember(messageId: Id, userId: Id) {
    if (!mongoose.isValidObjectId(messageId)) throw new NotFoundError("Message not found");

    const message = await MessageModel.findById(messageId);
    if (!message) throw new NotFoundError("Message not found");

    await getConversationForMember(message.conversation.toString(), userId);

    return message;
}

function getLastMessagePreview(message: { content?: string | null }, input: CreateMessageInput, fileCount: number) {
    if (message.content) return message.content;
    if (input.stickerUrl) return "Sent sticker";
    if (input.gifUrl) return "Sent gif";
    if (fileCount > 0) return "Sent photo";
    return "Sent message";
}

interface CreateMessageInput {
    conversationId?: string;
    content?: string;
    replyTo?: string;
    stickerUrl?: string;
    gifUrl?: string;
    files?: Express.Multer.File[];
}

export async function createMessage(senderId: Id, input: CreateMessageInput) {
    const conversation = await getConversationForMember(input.conversationId, senderId);

    const uploadedFiles: MediaFile[] = input.files?.length
        ? await Promise.all(input.files.map((file) => uploadToCloudinary(file, "messages")))
        : [];

    const newMessage = await MessageModel.create({
        sender: new ObjectId(senderId),
        conversation: conversation._id,
        content: input.content ?? null,
        replyTo: input.replyTo ? new ObjectId(input.replyTo) : null,
        mediaFiles: uploadedFiles,
        stickerUrl: input.stickerUrl ?? null,
        gifUrl: input.gifUrl ?? null,
        seenBy: [new ObjectId(senderId)],
    });

    const message = await MessageModel.populate(newMessage, MESSAGE_POPULATE);

    const lastMessage: LastMessage = {
        sender: new ObjectId(senderId),
        content: getLastMessagePreview(message, input, uploadedFiles.length),
        createdAt: message._id.getTimestamp(),
    };

    conversation.lastMessage = lastMessage;
    conversation.hiddenBy = [];
    await conversation.save();

    return message;
}

export async function getMessagesByPage(userId: Id, conversationId: string, page: number, limit: number) {
    await getConversationForMember(conversationId, userId);

    const condition = visibleMessagesCondition(conversationId, userId);

    const totalMessages = await MessageModel.countDocuments(condition);
    const totalPages = Math.ceil(totalMessages / limit);

    const messages = await MessageModel.find(condition)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate(MESSAGE_POPULATE);

    return { messages, totalMessages, totalPages };
}

interface CursorQuery {
    conversationId: string;
    direction: "init" | "next" | "prev" | "both";
    messageId?: string;
    limit: number;
}

/**
 * Cursor-based pagination, newest first. `init` loads the latest page; `next`/`prev` load
 * newer/older messages than the cursor; `both` loads a window around the cursor (used to jump to a search result).
 */
export async function getMessagesByCursor(userId: Id, { conversationId, direction, messageId, limit }: CursorQuery) {
    await getConversationForMember(conversationId, userId);

    const condition = visibleMessagesCondition(conversationId, userId);
    const hasMessageBefore = async (date: Date) =>
        (await MessageModel.exists({ ...condition, createdAt: { $lt: date } })) !== null;
    const hasMessageAfter = async (date: Date) =>
        (await MessageModel.exists({ ...condition, createdAt: { $gt: date } })) !== null;

    if (direction === "init") {
        const messages = await MessageModel.find(condition)
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate(MESSAGE_POPULATE);

        const oldest = messages[messages.length - 1];
        const hasPrevPage = messages.length === limit && !!oldest?.createdAt && (await hasMessageBefore(oldest.createdAt));

        return { messages, hasNextPage: false, hasPrevPage };
    }

    const cursor = messageId && mongoose.isValidObjectId(messageId) ? await findPopulatedMessage(messageId) : null;
    const cursorDate = cursor?.createdAt ? new Date(cursor.createdAt) : null;

    if (direction === "both") {
        if (!cursor || !cursorDate) return { messages: [], hasNextPage: false, hasPrevPage: false };

        const AROUND = 5;
        const [prevMessages, nextMessages] = await Promise.all([
            MessageModel.find({ ...condition, createdAt: { $lt: cursorDate } })
                .sort({ createdAt: -1 })
                .limit(AROUND)
                .populate(MESSAGE_POPULATE),
            MessageModel.find({ ...condition, createdAt: { $gt: cursorDate } })
                .sort({ createdAt: 1 })
                .limit(AROUND)
                .populate(MESSAGE_POPULATE),
        ]);

        const messages = [...nextMessages, cursor, ...prevMessages].sort(
            (a: Message, b: Message) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
        );

        return { messages, hasNextPage: false, hasPrevPage: false };
    }

    // next / prev
    const isNext = direction === "next";
    const rangeCondition = cursorDate ? { createdAt: isNext ? { $gt: cursorDate } : { $lt: cursorDate } } : {};

    const messages = await MessageModel.find({ ...condition, ...rangeCondition })
        .sort({ createdAt: isNext ? 1 : -1 })
        .limit(limit)
        .populate(MESSAGE_POPULATE);

    // Furthest message loaded in the requested direction
    const edge = messages[messages.length - 1];
    if (!edge?.createdAt) return { messages, hasNextPage: false, hasPrevPage: false };

    return {
        messages,
        hasNextPage: isNext && (await hasMessageAfter(edge.createdAt)),
        hasPrevPage: !isNext && (await hasMessageBefore(edge.createdAt)),
    };
}

export async function reactToMessage(userId: Id, messageId: Id, emoji: string) {
    const message = await getMessageForMember(messageId, userId);

    const hasReacted = message.reactions.some((reaction) => reaction.user.toString() === userId.toString());

    if (hasReacted) {
        await MessageModel.updateOne(
            { _id: message._id, "reactions.user": new ObjectId(userId) },
            { $set: { "reactions.$.emoji": emoji } }
        );
    } else {
        await MessageModel.updateOne(
            { _id: message._id },
            { $push: { reactions: { user: new ObjectId(userId), emoji } } }
        );
    }

    return findPopulatedMessage(message._id);
}

export async function removeReaction(userId: Id, messageId: Id) {
    const message = await getMessageForMember(messageId, userId);

    await MessageModel.updateOne({ _id: message._id }, { $pull: { reactions: { user: new ObjectId(userId) } } });

    return findPopulatedMessage(message._id);
}

function getEmojiFromClientInput(clientInput: string): string {
    const key = clientInput.toUpperCase() as keyof typeof E_EMOJI;

    if (!(key in E_EMOJI)) throw new BadRequestError("Invalid emoji");

    return E_EMOJI[key];
}

/** The message with only the reactions of the given emoji, their users populated */
export async function getUsersReactedMessage(userId: Id, messageId: string, emoji: string) {
    const emojiIcon = getEmojiFromClientInput(emoji); // Ex: convert 'heart' to '❤️'

    await getMessageForMember(messageId, userId);

    const message = await MessageModel.findOne({
        _id: new ObjectId(messageId),
        reactions: { $elemMatch: { emoji: emojiIcon } },
    })
        .populate({ path: "reactions.user", select: USER_MODEL_HIDDEN_FIELDS })
        .lean();

    if (!message) return null;

    return { ...message, reactions: message.reactions.filter((reaction) => reaction.emoji === emojiIcon) };
}

/** Delete a message for the current user only */
export async function deleteMessageForUser(userId: Id, messageId: Id) {
    const message = await getMessageForMember(messageId, userId);

    if (message.sender.toString() !== userId.toString()) {
        throw new ForbiddenError("You are not the sender of this message");
    }

    if (message.excludedFor.some((id) => id.toString() === userId.toString())) {
        throw new ForbiddenError("You have already deleted this message");
    }

    await MessageModel.findByIdAndUpdate(message._id, { $addToSet: { excludedFor: new ObjectId(userId) } });
}

/** Retract (unsend) a message for everyone */
export async function retractMessage(userId: Id, messageId: Id) {
    const message = await getMessageForMember(messageId, userId);

    if (message.sender.toString() !== userId.toString()) {
        throw new ForbiddenError("You are not the sender of this message");
    }

    if (message.excludedFor.some((id) => id.toString() === userId.toString())) {
        throw new BadRequestError("You have already deleted this message");
    }

    await MessageModel.findByIdAndUpdate(message._id, { isRetracted: true });

    return findPopulatedMessage(message._id);
}

/** Mark every message of the conversation as seen by the user; returns the latest seen message */
export async function markConversationAsSeen(userId: Id, conversationId: string) {
    await getConversationForMember(conversationId, userId);

    const conversation = new ObjectId(conversationId);
    const user = new ObjectId(userId);

    await MessageModel.updateMany({ conversation, seenBy: { $nin: [user] } }, { $addToSet: { seenBy: user } });

    return MessageModel.findOne({ conversation, seenBy: { $in: [user] } })
        .sort({ createdAt: -1 })
        .populate(MESSAGE_POPULATE);
}

export async function searchMessages(userId: Id, conversationId: string, search: string, page: number, limit: number) {
    await getConversationForMember(conversationId, userId);

    const condition = {
        ...visibleMessagesCondition(conversationId, userId),
        content: {
            $ne: null,
            $nin: ["", " "],
            $regex: escapeRegex(search.trim()),
            $options: "i",
        },
    };

    const totalMessages = await MessageModel.countDocuments(condition);
    const totalPages = Math.ceil(totalMessages / limit);

    const messages = await MessageModel.find(condition)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate(MESSAGE_POPULATE);

    return { messages, totalMessages, totalPages };
}
