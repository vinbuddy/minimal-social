import { ReactNode, useEffect } from "react";
import { AppState } from "react-native";

import { toast } from "@/components/ui";
import { invalidate } from "@/lib/invalidate";
import { setupPushNotifications } from "@/lib/push";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import useAuthStore from "@/stores/auth-store";
import { INotificationEvent } from "@/types/notification";

/**
 * Live updates while signed in: the socket (reconnected when the app comes back to the foreground), the unread
 * dot and an in-app toast for new notifications, and push registration on devices that support it.
 */
export function RealtimeProvider({ children }: { children: ReactNode }) {
    const userId = useAuthStore((state) => state.currentUser?._id);

    useEffect(() => {
        if (!userId) return;

        const socket = connectSocket();

        const onNotification = ({ notification, sender }: INotificationEvent) => {
            const currentUser = useAuthStore.getState().currentUser;
            if (currentUser) useAuthStore.getState().setCurrentUser({ ...currentUser, isNotification: true });
            invalidate("/notification");
            toast(`${sender?.username ?? "Someone"} ${notification.message}`);
        };
        socket.on("notification", onNotification);

        // iOS and Android drop sockets in the background; reconnect as soon as the app is back
        const appState = AppState.addEventListener("change", (state) => {
            if (state === "active") connectSocket();
        });

        const teardownPush = setupPushNotifications();

        return () => {
            socket.off("notification", onNotification);
            appState.remove();
            teardownPush();
            disconnectSocket();
        };
    }, [userId]);

    return children;
}
