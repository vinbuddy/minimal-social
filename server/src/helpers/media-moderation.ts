import axios from "axios";
import dotenv from "dotenv";
import { NuditySafetyValue, SightEngineResponse } from "../types/media-moderation";

dotenv.config();

export const moderateImage = async (url: string): Promise<boolean> => {
    if (!process.env.SIGHT_ENGINE_API_USER || !process.env.SIGHT_ENGINE_API_KEY || !process.env.SIGHT_ENGINE_API_URL) {
        throw new Error("Sight Engine API credentials are missing");
    }

    const params = {
        url: url,
        models: "nudity-2.1",
        api_user: process.env.SIGHT_ENGINE_API_USER,
        api_secret: process.env.SIGHT_ENGINE_API_KEY,
    };

    const apiURL = process.env.SIGHT_ENGINE_API_URL;
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
        console.error(error);
    }

    return true;
};
