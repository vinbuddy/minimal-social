import { CookieOptions } from "express";
import env from "dotenv";

env.config();

const cookieMode = {
    options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "strict",
    } as CookieOptions,
    isCookieMode: process.env.COOKIE_MODE === "true",
};

export default cookieMode;
