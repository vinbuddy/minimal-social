import { IUser } from "./user";

// Mirrors client/src/types/notification.ts
export type NotificationAction = "like" | "comment" | "follow" | "mention" | "repost";

export interface INotification {
    _id: string;
    target: string | null;
    targetType: "Comment" | "Post" | "Reel" | "User";
    action: NotificationAction;
    /** The first sender's photo when it was created */
    photo: string;
    /** Phrased for the receiver: "liked your post" */
    message: string;
    /** Web path it opens: /post/:id, /post/:id?commentId=…, /profile/:id */
    url: string | null;
    /** Everyone who did the same thing to the same target, oldest first */
    senders: IUser[];
    receivers: { receiver: IUser; isRead: boolean }[];
    createdAt: string;
    updatedAt: string;
}

/** The socket's `notification` event */
export interface INotificationEvent {
    notification: INotification;
    sender: IUser;
}
