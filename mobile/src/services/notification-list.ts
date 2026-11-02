import http from "@/lib/http";
import { NotificationAction } from "@/types/notification";

export type NotificationFilter = "all" | NotificationAction;

export const notificationsUrl = (userId: string, action: NotificationFilter) => `/notification/${userId}?action=${action}`;

/** Clears the unread flag (the API keeps one flag per user, not per notification) */
export async function markAllNotificationsRead(userId: string) {
    await http.post(`/notification/read-all/${userId}`);
}

export async function deleteNotification(notificationId: string) {
    await http.delete(`/notification/${notificationId}`);
}

export async function registerPushToken(token: string, platform: "ios" | "android") {
    await http.post("/notification/push-token", { token, platform });
}

/** Tokens passed in: called while signing out, right before they are cleared */
export async function removePushToken(token: string, accessToken: string) {
    await http.delete("/notification/push-token", { data: { token }, headers: { Authorization: `Bearer ${accessToken}` } });
}
