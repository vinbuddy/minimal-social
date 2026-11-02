import { IMediaFile } from "./post";
import { IUser } from "./user";

// Mirrors client/src/types/conversation.ts, message.ts, theme.ts, sticker.ts, with the server's real shapes

export interface ITheme {
    _id: string;
    name: string;
    /** CSS colour of your own bubbles */
    color: string;
    description: string | null;
}

export interface IConversation {
    _id: string;
    participants: IUser[];
    isGroup: boolean;
    groupInfo: { name: string; photo: string | null } | null;
    /** `sender` is a user id here, never populated */
    lastMessage: { sender: string; content: string; createdAt: string } | null;
    theme: ITheme | null;
    emoji: string | null;
    /** Only on the list endpoint: messages you haven't seen */
    unreadCount?: number;
    hiddenBy: string[];
    createdAt: string;
    updatedAt: string;
}

export interface IMessageReaction {
    user: IUser;
    emoji: string;
}

export interface IMessage {
    _id: string;
    sender: IUser;
    /** Populated with participants, but without the theme */
    conversation: IConversation | string;
    /** The web editor's HTML; null once retracted */
    content: string | null;
    mediaFiles: IMediaFile[];
    stickerUrl: string | null;
    /** A Giphy embed_url */
    gifUrl: string | null;
    /** Populated one level: its own `sender` is an id */
    replyTo: (Omit<IMessage, "sender"> & { sender: string }) | null;
    reactions: IMessageReaction[];
    isEdited: boolean;
    isRetracted: boolean;
    seenBy: IUser[];
    createdAt: string;
    updatedAt: string;
}

export interface IStickerPack {
    _id: string;
    name: string;
    thumbnail: string;
    stickers: { publicId?: string; tags: string[]; url: string }[];
}

/** The private-conversation search: people matching the name, with your conversation if there is one */
export interface IConversationSearchResult {
    privateConversations: { conversation: IConversation | null; user: IUser }[];
    groupConversations: IConversation[];
}

/** The five reactions the server can list (`heart`, `haha`, `wow`, `sad`, `angry`) */
export const REACTIONS = ["❤️", "😆", "😮", "😢", "😡"] as const;

export function conversationIdOf(message: IMessage) {
    return typeof message.conversation === "string" ? message.conversation : message.conversation._id;
}
