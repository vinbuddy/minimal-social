import { IConversation } from "./conversation";
import { IMediaFile } from "./post";
import { IUser } from "./user";

export interface IMessageReaction {
    user: IUser;
    reaction: string;
}

export interface IMessage {
    _id: string;
    sender: IUser;
    conversation: IConversation;
    content: string;
    mediaFiles: IMediaFile[];
    replyTo: IMessage;
    reaction: IMessageReaction[];
    isEdited: boolean;
    isRetracted: boolean;
    seenBy: IUser[];
    createdAt: string;
    updatedAt: string;
}
