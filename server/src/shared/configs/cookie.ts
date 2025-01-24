import { CookieOptions } from "express";
import env from "dotenv";

env.config();

const cookieMode = {
    options: {
        httpOnly: true,
        secure: process.env.ENVIRONMENT === "production",
        path: "/",
        sameSite: "strict",
    } as CookieOptions,
    isCookieMode: process.env.COOKIE_MODE === "true",
};

export default cookieMode;
