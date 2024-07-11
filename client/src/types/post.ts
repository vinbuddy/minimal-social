import { IUser } from "./user";

export interface IMediaFile {
    publicId?: string;
    url: string;
    file?: File;
    width: number;
    height: number;
    type: "image" | "video";
}

export interface IPost {
    _id: string;
    postBy: IUser;
    caption: string;
    mediaFiles: IMediaFile[];
    likes: any[];
    tags: any[];
    mentions: IUser[];
    isEdited: boolean;
    createdAt: string;
    updatedAt: string;
    likeCount?: number;
    commentCount?: number;
}

// export type PostType = "Feed" | "Following" | "UserPosts";
