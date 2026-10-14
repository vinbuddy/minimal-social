import axios from "axios";
import envConfig from "../configs/env";
import logger from "../configs/logger";
import { NuditySafetyValue, SightEngineResponse } from "../types/media-moderation";

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
