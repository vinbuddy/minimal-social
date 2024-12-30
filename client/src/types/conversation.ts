import { ITheme } from "./theme";
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
    theme: ITheme | null;
    emoji: string | null;
    unreadCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface IPrivateConversationResult {
    conversation: IConversation;
    user: IUser;
}
