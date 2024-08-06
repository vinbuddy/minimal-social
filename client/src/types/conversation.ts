import { IUser } from "./user";

export interface IGroupInfo {
    name: string;
    photo: string | null;
}

export interface ILastMessage {
    sender: IUser;
    content: string;
    createdAt: string;
}

export interface IConversation {
    _id: string;
    participants: IUser[];
    isGroup: boolean;
    groupInfo: IGroupInfo | null;
    lastMessage: ILastMessage | null;
    theme: string | null;
    emoji: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface IPrivateConversationResult {
    conversation: IConversation;
    user: IUser;
}
