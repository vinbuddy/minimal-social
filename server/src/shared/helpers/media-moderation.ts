import axios from "axios";
import cloudinary from "../configs/cloudinary";
import envConfig from "../configs/env";
import logger from "../configs/logger";
import { NuditySafetyValue, SightEngineResponse } from "../types/media-moderation";

// Near the start, middle and end, so a short unsafe segment is still likely to be sampled
const VIDEO_FRAME_OFFSETS = ["so_10p", "so_50p", "so_90p"];

/**
 * SightEngine's image check cannot read video files, so a video is checked through
 * still frames that Cloudinary cuts from it. Images are checked as they are.
 */
export const getModerationImageUrls = (file: { publicId: string; url: string; type: string }): string[] => {
    if (file.type !== "video") return [file.url];

    return VIDEO_FRAME_OFFSETS.map((offset) =>
        cloudinary.url(file.publicId, {
            resource_type: "video",
            secure: true,
            raw_transformation: `${offset}/c_limit,w_720`,
            format: "jpg",
        })
    );
};

/** True when every image (or video frame) of the media files is safe */
export const moderateMediaFiles = async (files: { publicId: string; url: string; type: string }[]) => {
    const results = await Promise.all(files.flatMap(getModerationImageUrls).map((url) => moderateImage(url)));

    return results.every(Boolean);
};

export const moderateImage = async (url: string): Promise<boolean> => {
    if (!envConfig.SIGHT_ENGINE_API_USER || !envConfig.SIGHT_ENGINE_API_KEY || !envConfig.SIGHT_ENGINE_API_URL) {
        throw new Error("Sight Engine API credentials are missing");
    }

    const params = {
        url: url,
        models: "nudity-2.1",
        api_user: envConfig.SIGHT_ENGINE_API_USER,
        api_secret: envConfig.SIGHT_ENGINE_API_KEY,
    };

    const apiURL = envConfig.SIGHT_ENGINE_API_URL;
    try {
        const response = await axios.get(apiURL, { params });
        const data = response.data as SightEngineResponse;

        if (
            data.nudity.sexual_activity > NuditySafetyValue.SEXUAL_ACTIVITY ||
            data.nudity.sexual_display > NuditySafetyValue.SEXUAL_ACTIVITY ||
            data.nudity.erotica > NuditySafetyValue.EROTICA
        ) {
            return false;
        }
    } catch (error) {
        logger.error("Image moderation request failed", { url, error });
    }

    return true;
};
