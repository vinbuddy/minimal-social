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
    originalPost: IPost | null;
    mediaFiles: IMediaFile[];
    tags: any[];
    mentions: IUser[];
    isEdited: boolean;
    createdAt: string;
    updatedAt: string;
    likeCount?: number;
    commentCount?: number;
    repostCount?: number;
    // Computed by the API for the current user
    isLiked?: boolean;
    isReposted?: boolean;
}

export interface ISelectMediaFile {
    mediaFiles: IMediaFile[];
    index: number;
}

// export type PostType = "Feed" | "Following" | "UserPosts";
