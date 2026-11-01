import * as ImagePicker from "expo-image-picker";

import i18n from "@/i18n";
import { LocalMediaFile } from "@/services/posts";

/** The web's limits (client/src/utils/media-file.ts); the web has no count limit, the app caps it */
export const MAX_MEDIA_FILES = 10;
const MAX_IMAGE_MB = 50;
const MAX_VIDEO_MB = 100;

/** Pick up to `remaining` photos/videos; returns the accepted files and a message for any rejected */
export async function pickMedia(remaining: number): Promise<{ files: LocalMediaFile[]; error?: string }> {
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsMultipleSelection: true,
        selectionLimit: remaining,
        orderedSelection: true,
        quality: 0.8,
    });
    if (result.canceled) return { files: [] };

    const files: LocalMediaFile[] = [];
    let error: string | undefined;

    for (const asset of result.assets.slice(0, remaining)) {
        const type = asset.type === "video" ? "video" : "image";
        const limitMb = type === "video" ? MAX_VIDEO_MB : MAX_IMAGE_MB;
        const name = asset.fileName ?? `${type}-${Date.now()}.${type === "video" ? "mp4" : "jpg"}`;

        if (asset.fileSize && asset.fileSize > limitMb * 1024 * 1024) {
            error = i18n.t("app:MEDIA_TOO_LARGE", { name, size: limitMb });
            continue;
        }

        files.push({
            uri: asset.uri,
            name,
            mimeType: asset.mimeType ?? (type === "video" ? "video/mp4" : "image/jpeg"),
            type,
            width: asset.width,
            height: asset.height,
        });
    }

    if (result.assets.length > remaining) error = i18n.t("app:MEDIA_LIMIT", { count: MAX_MEDIA_FILES });
    return { files, error };
}
