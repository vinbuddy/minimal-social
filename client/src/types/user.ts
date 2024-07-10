export interface IUser {
    _id: string;

    username: string;

    email: string;

    photo: string;

    isAdmin?: boolean;

    followings: IUser[];

    followers: IUser[];

    bio: string;

    isVerified: boolean;
}
