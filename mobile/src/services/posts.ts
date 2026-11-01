import { Platform } from "react-native";

import http from "@/lib/http";
import { IPost } from "@/types/post";

export type FeedType = "feed" | "following" | "liked";

/** The web's three home tabs */
export const FEED_URLS: Record<FeedType, string> = {
    feed: "/post",
    following: "/post/following",
    liked: "/post/liked",
};

/** A file picked on the device, uploaded as one `mediaFiles` part */
export type LocalMediaFile = { uri: string; name: string; mimeType: string; type: "image" | "video"; width: number; height: number };

export async function createPost(caption: string, mediaFiles: LocalMediaFile[]) {
    const form = new FormData();
    form.append("caption", caption);
    for (const file of mediaFiles) {
        if (Platform.OS === "web") {
            // The web preview's picker gives blob: URLs, which FormData needs as real Blobs
            form.append("mediaFiles", await (await fetch(file.uri)).blob(), file.name);
        } else {
            // React Native's FormData takes { uri, name, type } in place of a Blob
            form.append("mediaFiles", { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob);
        }
    }

    const res = await http.post<{ data: IPost }>("/post", form, {
        headers: { "Content-Type": "multipart/form-data" },
        // Videos can take a while on mobile networks
        timeout: 5 * 60 * 1000,
    });
    return res.data.data;
}

export async function editPost(postId: string, caption: string) {
    const res = await http.put<{ data: IPost }>("/post", { postId, caption });
    return res.data.data;
}

export async function deletePost(postId: string) {
    await http.delete(`/post/${postId}`);
}

export async function getPost(postId: string) {
    const res = await http.get<{ data: IPost }>(`/post/${postId}`);
    return res.data.data;
}

export async function likePost(postId: string) {
    await http.post("/post/like", { postId });
}

export async function unlikePost(postId: string) {
    await http.post("/post/unlike", { postId });
}

export async function repost(postId: string) {
    await http.post("/post/repost", { postId });
}

export async function unrepost(originalPostId: string) {
    await http.post("/post/un-repost", { originalPostId });
}
