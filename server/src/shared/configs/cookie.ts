import { CookieOptions } from "express";
import env from "dotenv";

env.config();

const cookieMode = {
    options: {
        httpOnly: true,
        secure: process.env.ENVIRONMENT === "production",
        path: "/",
        sameSite: "none",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    } as CookieOptions,
    isCookieMode: process.env.COOKIE_MODE === "true",
};

export default cookieMode;
