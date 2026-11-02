import axios from "axios";
import mongoose from "mongoose";

import logger from "../../shared/configs/logger";
import { PushTokenModel } from "./push-token.model";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
/** Expo accepts up to 100 messages per request */
const BATCH_SIZE = 100;

type PushMessage = {
    title: string;
    body: string;
    /** Read by the app when the notification is tapped, e.g. { url: "/post/123" } */
    data?: Record<string, unknown>;
};

type ExpoTicket = { status: "ok" | "error"; message?: string; details?: { error?: string } };

export async function registerPushToken(userId: string, token: string, platform: "ios" | "android") {
    await PushTokenModel.findOneAndUpdate({ token }, { user: userId, token, platform }, { upsert: true, new: true });
}

export async function removePushToken(userId: string, token: string) {
    await PushTokenModel.deleteOne({ user: userId, token });
}

/**
 * Sends a push to every device of `receiverIds` through Expo's push service. Never throws: a push is a nicety on
 * top of the stored notification and the socket event, so failures are only logged. Tokens Expo reports as
 * no longer registered (app uninstalled, permission revoked) are deleted.
 */
export async function sendPushNotifications(receiverIds: (string | mongoose.Types.ObjectId)[], message: PushMessage) {
    try {
        const tokens = await PushTokenModel.find({ user: { $in: receiverIds } }).select("token").lean();
        if (tokens.length === 0) return;

        for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
            const batch = tokens.slice(i, i + BATCH_SIZE);
            const response = await axios.post<{ data: ExpoTicket[] }>(
                EXPO_PUSH_URL,
                batch.map(({ token }) => ({ to: token, sound: "default", title: message.title, body: message.body, data: message.data })),
                { headers: { "Content-Type": "application/json", Accept: "application/json" }, timeout: 10_000 }
            );

            const stale = response.data.data
                .map((ticket, index) => (ticket.details?.error === "DeviceNotRegistered" ? batch[index].token : null))
                .filter((token): token is string => !!token);

            if (stale.length > 0) await PushTokenModel.deleteMany({ token: { $in: stale } });
        }
    } catch (error) {
        logger.error("Failed to send push notifications", { error });
    }
}
