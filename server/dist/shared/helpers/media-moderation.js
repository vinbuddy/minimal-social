"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moderateImage = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const media_moderation_1 = require("../types/media-moderation");
dotenv_1.default.config();
const moderateImage = (url) => __awaiter(void 0, void 0, void 0, function* () {
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
        const response = yield axios_1.default.get(apiURL, { params });
        const data = response.data;
        if (data.nudity.sexual_activity > media_moderation_1.NuditySafetyValue.SEXUAL_ACTIVITY ||
            data.nudity.sexual_display > media_moderation_1.NuditySafetyValue.SEXUAL_ACTIVITY ||
            data.nudity.erotica > media_moderation_1.NuditySafetyValue.EROTICA) {
            return false;
        }
    }
    catch (error) {
        console.error(error);
    }
    return true;
});
exports.moderateImage = moderateImage;
//# sourceMappingURL=media-moderation.js.map