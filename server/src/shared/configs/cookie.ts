import { CookieOptions, Response } from "express";
import envConfig from "./env";

const isProduction = envConfig.ENVIRONMENT === "production";

// Client and API are on different origins in production, so cookies must be SameSite=None + Secure there
export const authCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProduction,
    path: "/",
    sameSite: isProduction ? "none" : "strict",
};

const ACCESS_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days (the JWT itself may expire sooner)
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

export function setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
    return res
        .cookie("accessToken", tokens.accessToken, { ...authCookieOptions, maxAge: ACCESS_TOKEN_MAX_AGE })
        .cookie("refreshToken", tokens.refreshToken, { ...authCookieOptions, maxAge: REFRESH_TOKEN_MAX_AGE });
}

export function clearAuthCookies(res: Response) {
    return res.clearCookie("accessToken", authCookieOptions).clearCookie("refreshToken", authCookieOptions);
}
