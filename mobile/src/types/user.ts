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
    // Only on GET /user/:id; isFollowing also on follower/following list rows
    followerCount?: number;
    followingCount?: number;
    /** Whether the signed-in user follows this user */
    isFollowing?: boolean;
}
