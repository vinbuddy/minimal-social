import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";

import { registerPushToken, removePushToken } from "@/services/notification-list";
import { openAppUrl } from "./app-links";

type NotificationsModule = typeof import("expo-notifications");

const projectId: string | undefined = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

/**
 * Remote push needs a development or store build on a real device, and an EAS project id to issue Expo push
 * tokens. Expo Go, simulators and the web preview get live updates from the socket only.
 */
export const isPushSupported =
    Platform.OS !== "web" && Constants.executionEnvironment !== ExecutionEnvironment.StoreClient && Device.isDevice && !!projectId;

let registeredToken: string | null = null;

function getNotifications(): NotificationsModule {
    // Loaded only where push is supported: Expo Go no longer ships remote push
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("expo-notifications") as NotificationsModule;
}

async function register(Notifications: NotificationsModule) {
    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", { name: "default", importance: Notifications.AndroidImportance.DEFAULT });
    }

    const existing = await Notifications.getPermissionsAsync();
    const { status } = existing.granted ? existing : await Notifications.requestPermissionsAsync();
    if (status !== "granted") return;

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    await registerPushToken(token, Platform.OS === "ios" ? "ios" : "android");
    registeredToken = token;
}

/** Registers this device for push and opens the right screen when a notification is tapped. Returns a teardown */
export function setupPushNotifications(): () => void {
    if (!isPushSupported) return () => {};

    const Notifications = getNotifications();

    // In the foreground the socket already shows a toast; keep the push in Notification Center only
    Notifications.setNotificationHandler({
        handleNotification: async () => ({ shouldShowBanner: false, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
    });

    register(Notifications).catch(() => {
        // Push is optional: the app works without it
    });

    const openFrom = (response: { notification: { request: { content: { data?: Record<string, unknown> } } } } | null) => {
        const url = response?.notification.request.content.data?.url;
        if (typeof url === "string") openAppUrl(url);
    };

    // Opened by tapping a notification while the app was closed
    openFrom(Notifications.getLastNotificationResponse());
    const subscription = Notifications.addNotificationResponseReceivedListener(openFrom);

    return () => subscription.remove();
}

/** Stops pushes to this device for the account signing out. Best effort */
export async function unregisterPush(accessToken: string) {
    if (!registeredToken) return;
    const token = registeredToken;
    registeredToken = null;
    await removePushToken(token, accessToken);
}
