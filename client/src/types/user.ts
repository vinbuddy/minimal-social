export interface IUser {
    _id: string;

    username: string;

    email: string;

    photo: string;

    isAdmin?: boolean;

    friendRequests: IUser[];

    friends: IUser[];

    bio: string;

    isVerified: boolean;
}
