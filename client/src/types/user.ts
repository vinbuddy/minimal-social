export interface IUser {
    _id: string;

    username: string;

    email: string;

    photo: string;

    isAdmin?: boolean;

    followings: string[];

    followers: string[];

    /** From GET /user/:id only */
    followerCount?: number;

    followingCount?: number;

    /** Whether the viewer follows this user (GET /user/:id only) */
    isFollowing?: boolean;

    bio: string;

    isVerified: boolean;

    isNotification: boolean;

    blockedUsers: IUser[];

    googleId?: string;

    createdAt: string;

    updatedAt: string;
}

export interface IUserBadgeTheme {
    [key: string]: {
        icon: JSX.Element;
        color: "danger" | "success" | "primary" | "default" | "secondary" | "warning" | undefined;
    };
}
