"use server";

import { IUser } from "@/types/user";
import { StreamClient } from "@stream-io/node-sdk";

export const streamTokenProvider = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
        credentials: "include",
    });
    const result = await response.json();
    const user = result.data as IUser;

    if (!user) throw new Error("User not authenticated");

    const streamClient = new StreamClient(process.env.NEXT_PUBLIC_STREAM_API_KEY!, process.env.STREAM_SECRET_KEY!);

    const token = streamClient.generateUserToken({ user_id: user._id });

    return token;
};
