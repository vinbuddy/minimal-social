import axios from "axios";
import { IReelUploadSignature } from "@/types/reel";

export const REEL_ACCEPTED_TYPES = "video/mp4,video/quicktime,video/webm";

export interface IVideoMetadata {
    duration: number;
    width: number;
    height: number;
}

/** "98,6 N" in Vietnamese, "98.6K" in English */
export function formatCompactNumber(value: number, language: string = "vi"): string {
    return new Intl.NumberFormat(language, { notation: "compact", maximumFractionDigits: 1 }).format(value ?? 0);
}

export function formatDuration(seconds: number): string {
    const safe = Math.max(0, Math.floor(seconds || 0));
    return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

/**
 * Close-to-portrait videos fill the 9:16 frame; anything wider (landscape, square)
 * is letterboxed so nothing important gets cropped away.
 */
export function getVideoFit(width: number, height: number): "cover" | "contain" {
    if (!width || !height) return "cover";

    const ratio = width / height;
    return ratio >= 0.5 && ratio <= 0.65 ? "cover" : "contain";
}

/** Reads duration and size from a local file before uploading it */
export function readVideoMetadata(file: File): Promise<IVideoMetadata> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const video = document.createElement("video");

        video.preload = "metadata";
        video.onloadedmetadata = () => {
            resolve({ duration: video.duration, width: video.videoWidth, height: video.videoHeight });
            URL.revokeObjectURL(url);
        };
        video.onerror = () => {
            reject(new Error("Unsupported video"));
            URL.revokeObjectURL(url);
        };
        video.src = url;
    });
}

/** Direct browser → Cloudinary upload with a server-issued signature */
export async function uploadVideoToCloudinary(
    file: File,
    signature: IReelUploadSignature,
    onProgress: (percent: number) => void,
    signal?: AbortSignal
): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signature.apiKey);
    formData.append("timestamp", String(signature.timestamp));
    formData.append("signature", signature.signature);
    formData.append("public_id", signature.publicId);

    const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${signature.cloudName}/video/upload`,
        formData,
        {
            signal,
            onUploadProgress: (event) => {
                if (event.total) onProgress(Math.round((event.loaded / event.total) * 100));
            },
        }
    );

    return response.data.public_id as string;
}
