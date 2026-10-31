import { CookieOptions, Request, Response } from "express";
import envConfig from "./env";
import { isMobileClient } from "../helpers/request-auth";

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

/** Web gets httpOnly cookies; mobile can't use them, so it gets the tokens in the JSON body instead */
export function sendAuthTokens(
    req: Request,
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
    body: Record<string, unknown>
) {
    if (isMobileClient(req)) {
        return res.status(200).json({ ...body, tokens });
    }

    return setAuthCookies(res, tokens).status(200).json(body);
}

export function clearAuthCookies(res: Response) {
    return res.clearCookie("accessToken", authCookieOptions).clearCookie("refreshToken", authCookieOptions);
}
