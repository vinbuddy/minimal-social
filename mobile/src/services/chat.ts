import { Platform } from "react-native";

import http from "@/lib/http";
import { IConversation, IConversationSearchResult, IMessage, IStickerPack, ITheme } from "@/types/chat";
import { IMediaFile } from "@/types/post";
import { LocalMediaFile } from "./posts";

export const conversationsUrl = "/conversation";
export const conversationUrl = (id: string) => `/conversation/${id}`;
export const conversationMediaUrl = (id: string) => `/conversation/storage/media-file?conversationId=${id}`;
export const messageSearchUrl = (conversationId: string, search: string) =>
    `/message/search?conversationId=${conversationId}&search=${encodeURIComponent(search)}`;

/** Opens (or creates) your private conversation with `userId`; returns its id */
export async function openConversationWith(currentUserId: string, userId: string) {
    const res = await http.post<{ data: IConversation }>("/conversation", { participants: [currentUserId, userId] });
    return res.data.data._id;
}

export async function searchConversations(search: string) {
    const res = await http.get<{ data: IConversationSearchResult }>("/conversation/search", { params: { search } });
    return res.data.data;
}

export type MessagePage = { data: IMessage[]; hasNextPage: boolean; hasPrevPage: boolean };

/**
 * Cursor pages, newest first except `next` (oldest first): `init` is the latest messages, `prev` those older than
 * `messageId`, `both` five on each side of `messageId` (a search jump).
 */
export async function getMessages(conversationId: string, direction: "init" | "prev" | "next" | "both", messageId?: string, limit = 20) {
    const res = await http.get<MessagePage>("/message/cursor-pagination", { params: { conversationId, direction, messageId, limit } });
    return res.data;
}

export async function sendMessage(input: { conversationId: string; content?: string; replyTo?: string; stickerUrl?: string; mediaFiles?: LocalMediaFile[] }) {
    const { mediaFiles = [], ...fields } = input;

    // Text and media go in one request (the server accepts both; the web sends two)
    if (mediaFiles.length === 0) {
        const res = await http.post<{ data: IMessage }>("/message", fields);
        return res.data.data;
    }

    const form = new FormData();
    Object.entries(fields).forEach(([key, value]) => value !== undefined && form.append(key, value));
    for (const file of mediaFiles) {
        if (Platform.OS === "web") {
            form.append("mediaFiles", await (await fetch(file.uri)).blob(), file.name);
        } else {
            form.append("mediaFiles", { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob);
        }
    }
    const res = await http.post<{ data: IMessage }>("/message", form, { headers: { "Content-Type": "multipart/form-data" }, timeout: 5 * 60 * 1000 });
    return res.data.data;
}

/** One reaction per person: reacting again replaces it */
export async function reactToMessage(messageId: string, emoji: string) {
    const res = await http.post<{ data: IMessage }>(`/message/reaction/${messageId}`, { emoji });
    return res.data.data;
}

export async function removeReaction(messageId: string) {
    const res = await http.post<{ data: IMessage }>(`/message/unreaction/${messageId}`);
    return res.data.data;
}

/** Unsend for everyone (sender only) */
export async function retractMessage(messageId: string) {
    await http.delete(`/message/retract/${messageId}`);
}

/** Delete for me (sender only, as on the web) */
export async function deleteMessage(messageId: string) {
    await http.delete(`/message/delete/${messageId}`);
}

export async function markConversationSeen(conversationId: string) {
    await http.post("/message/mark-seen", { conversationId });
}

export async function changeConversationTheme(conversationId: string, themeId: string) {
    const res = await http.put<{ data: IConversation }>(`/conversation/change-theme/${conversationId}`, { themeId });
    return res.data.data;
}

export async function changeConversationEmoji(conversationId: string, emoji: string) {
    const res = await http.put<{ data: IConversation }>(`/conversation/change-emoji/${conversationId}`, { emoji });
    return res.data.data;
}

/** Hides the conversation and its history for you */
export async function deleteConversation(conversationId: string) {
    await http.delete(`/conversation/${conversationId}`);
}

export async function getThemes() {
    const res = await http.get<{ data: ITheme[] }>("/theme");
    return res.data.data;
}

export async function getStickerPacks() {
    const res = await http.get<{ data: IStickerPack[] }>("/sticker");
    return res.data.data;
}

export type ConversationMediaPage = { data: IMediaFile[] };
