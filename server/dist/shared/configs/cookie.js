"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cookieMode = {
    options: {
        httpOnly: true,
        secure: process.env.ENVIRONMENT === "production",
        path: "/",
        sameSite: "none",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
    isCookieMode: process.env.COOKIE_MODE === "true",
};
exports.default = cookieMode;
//# sourceMappingURL=cookie.js.map