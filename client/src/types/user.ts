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
}
