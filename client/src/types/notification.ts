import { IUser } from "./user";

export interface INotificationReceiver {
    receiver: IUser;

    isRead: boolean;
}

export interface INotification {
    _id: string;

    target: string;

    targetType: string;

    action: "like" | "comment" | "follow" | "mention" | "repost";

    photo: string;

    message: string;

    url: string | null;

    senders: IUser[];

    receivers: INotificationReceiver[];

    createdAt: string;

    updatedAt: string;
}

export interface INotificationTheme {
    [key: string]: {
        icon: JSX.Element;
        color: "danger" | "success" | "primary" | "default" | "secondary" | "warning" | undefined;
    };
}
