import { Request } from "express";

/** Native apps can't use httpOnly cookies, so they send this header and receive tokens in the response body */
export const CLIENT_TYPE_HEADER = "x-client-type";

export function isMobileClient(req: Request): boolean {
    return req.get(CLIENT_TYPE_HEADER)?.toLowerCase() === "mobile";
}

/** `Authorization: Bearer <token>` (mobile) takes precedence over the accessToken cookie (web) */
export function getAccessToken(req: Request): string | undefined {
    return getBearerToken(req.get("authorization")) ?? req.cookies?.["accessToken"];
}

/** Mobile sends the refresh token in the body; web keeps it in a cookie */
export function getRefreshToken(req: Request): string | undefined {
    const bodyToken = req.body?.refreshToken;

    return typeof bodyToken === "string" && bodyToken ? bodyToken : req.cookies?.["refreshToken"];
}

export function getBearerToken(authorization: string | undefined): string | undefined {
    const [scheme, token] = authorization?.split(" ") ?? [];

    return scheme?.toLowerCase() === "bearer" && token ? token : undefined;
}
