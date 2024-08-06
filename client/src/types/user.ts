export interface IUser {
    _id: string;

    username: string;

    email: string;

    photo: string;

    isAdmin?: boolean;

    followings: string[];

    followers: string[];

    bio: string;

    isVerified: boolean;

    isNotification: boolean;
}

export interface IUserBadgeTheme {
    [key: string]: {
        icon: JSX.Element;
        color: "danger" | "success" | "primary" | "default" | "secondary" | "warning" | undefined;
    };
}
