import { IConversation } from "./conversation";
import { IMediaFile } from "./post";
import { IUser } from "./user";

export interface IMessageReaction {
    user: IUser;
    emoji: string;
}

export interface IMessage {
    _id: string;
    sender: IUser;
    conversation: IConversation;
    content: string;
    mediaFiles: IMediaFile[];
    stickerUrl: string | null;
    gifUrl: string | null;
    replyTo: IMessage;
    reactions: IMessageReaction[];
    isEdited: boolean;
    isRetracted: boolean;
    seenBy: IUser[];
    createdAt: string;
    updatedAt: string;
}
