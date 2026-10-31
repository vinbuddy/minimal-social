// Mirrors client/src/types/user.ts
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
    blockedUsers: IUser[];
    googleId?: string;
    createdAt: string;
    updatedAt: string;
}
