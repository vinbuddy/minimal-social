import { CookieOptions } from "express";

const cookieMode = {
    options: {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict",
    } as CookieOptions,
    isCookieMode: process.env.COOKIE_MODE === "true",
};

export default cookieMode;
