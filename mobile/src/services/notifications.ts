import http from "@/lib/http";
import { IUser } from "@/types/user";

type NotificationInput = {
    target?: string;
    targetType: "Post" | "Comment" | "Reel" | "User";
    action: "like" | "comment" | "follow" | "mention" | "repost";
    /** Already phrased for the receiver: "liked your post" */
    message: string;
    receivers: string[];
    /** Web route the notification opens */
    url?: string;
};

/**
 * The server doesn't notify on its own: like the web, the client posts a notification after an action.
 * Fire-and-forget: a lost notification must never undo or fail the action itself.
 */
export function notify(sender: IUser | null, input: NotificationInput) {
    const receivers = input.receivers.filter((id) => id && id !== sender?._id);
    if (!sender || receivers.length === 0) return;

    http.post("/notification", { ...input, receivers, photo: sender.photo, sender: sender._id }).catch(() => {});
}
