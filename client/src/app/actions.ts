"use server";

import { IUser } from "@/types/user";
import { cookies } from "next/headers";
import { StreamClient } from "@stream-io/node-sdk";
import { ENV } from "@/config/env";

export const streamTokenProvider = async () => {
    const cookieStore = cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    const response = await fetch(`${ENV.API_BASE_URL}/auth/me`, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            Cookie: `accessToken=${accessToken}`,
        },
    });
    const result = await response.json();
    const user = result.data as IUser;
    const streamClient = new StreamClient(ENV.STREAM_API_KEY!, ENV.STREAM_SECRET_KEY!);

    const now = Math.floor(Date.now() / 1000);
    const adjustedIat = now - 10;

    const token = streamClient.generateUserToken({ user_id: user._id, iat: adjustedIat });

    return token;
};
