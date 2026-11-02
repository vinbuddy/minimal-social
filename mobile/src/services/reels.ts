import { Platform } from "react-native";

import { ENV } from "@/config/env";
import http from "@/lib/http";
import { IReel, IReelAudio, IReelUploadSignature } from "@/types/reel";

export const reelFeedUrl = (exclude?: string) => (exclude ? `/reel/feed?exclude=${exclude}` : "/reel/feed");
export const userReelsUrl = (userId: string) => `/reel/user/${userId}`;
export const audioUrl = (audioId: string) => `/reel/audio/${audioId}`;
export const audioReelsUrl = (audioId: string) => `/reel/audio/${audioId}/reels`;
export const savedAudiosUrl = "/reel/audio/saved";

/** The web's limits (the server rejects longer or larger videos after upload) */
export const REEL_MAX_DURATION = 90;
export const REEL_MAX_MB = 100;

/** The web page a reel lives at, for sharing; null when the web URL isn't configured */
export const reelWebUrl = (reelId: string) => (ENV.WEB_URL ? `${ENV.WEB_URL}/reels/${reelId}` : null);

export async function getReel(reelId: string) {
    const res = await http.get<{ data: IReel }>(`/reel/${reelId}`);
    return res.data.data;
}

/** Like and unlike return the new count only */
export async function likeReel(reelId: string) {
    const res = await http.post<{ data: { likeCount: number } }>("/reel/like", { reelId });
    return res.data.data.likeCount;
}

export async function unlikeReel(reelId: string) {
    const res = await http.post<{ data: { likeCount: number } }>("/reel/unlike", { reelId });
    return res.data.data.likeCount;
}

/** Counted once per person per reel */
export async function viewReel(reelId: string) {
    await http.post(`/reel/${reelId}/view`);
}

export async function deleteReel(reelId: string) {
    await http.delete(`/reel/${reelId}`);
}

export async function getAudio(audioId: string) {
    const res = await http.get<{ data: IReelAudio }>(audioUrl(audioId));
    return res.data.data;
}

export async function saveAudio(audioId: string) {
    await http.post(`/reel/audio/${audioId}/save`);
}

export async function unsaveAudio(audioId: string) {
    await http.delete(`/reel/audio/${audioId}/save`);
}

export type LocalVideo = { uri: string; name: string; mimeType: string };

/**
 * Uploads straight to Cloudinary with a signature from the server, as the web does, so a 100MB video never goes
 * through the API. XMLHttpRequest for progress events. `signal` aborts it.
 */
export async function uploadReelVideo(video: LocalVideo, onProgress: (fraction: number) => void, signal: AbortSignal) {
    const signature = (await http.post<{ data: IReelUploadSignature }>("/reel/upload-signature")).data.data;

    const form = new FormData();
    if (Platform.OS === "web") {
        form.append("file", await (await fetch(video.uri)).blob(), video.name);
    } else {
        form.append("file", { uri: video.uri, name: video.name, type: video.mimeType } as unknown as Blob);
    }
    // Only these are signed; any other field would break the signature
    form.append("api_key", signature.apiKey);
    form.append("timestamp", String(signature.timestamp));
    form.append("signature", signature.signature);
    form.append("public_id", signature.publicId);

    await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${signature.cloudName}/video/upload`);
        xhr.upload.onprogress = (event) => event.lengthComputable && onProgress(event.loaded / event.total);
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(uploadError(xhr.responseText))));
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.onabort = () => reject(new DOMException("Aborted", "AbortError"));
        signal.addEventListener("abort", () => xhr.abort());
        xhr.send(form);
    });

    return signature.publicId;
}

function uploadError(body: string) {
    try {
        return (JSON.parse(body) as { error?: { message?: string } }).error?.message ?? "Upload failed";
    } catch {
        return "Upload failed";
    }
}

/** Publishes an uploaded video; the server checks its length and size and queues moderation */
export async function createReel(input: { publicId: string; caption: string; audioId?: string }) {
    const res = await http.post<{ data: IReel }>("/reel", input, { timeout: 2 * 60 * 1000 });
    return res.data.data;
}
