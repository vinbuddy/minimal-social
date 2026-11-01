import { IUser } from "./user";

// Mirrors client/src/types/post.ts, with the server's aggregated fields
export interface IMediaFile {
    publicId?: string;
    url: string;
    width: number;
    height: number;
    type: "image" | "video";
}

export interface IPost {
    _id: string;
    postBy: IUser;
    caption: string;
    /** Set on a repost: the post being shared. A repost has no caption or media of its own */
    originalPost: IPost | null;
    mediaFiles: IMediaFile[];
    tags: string[];
    mentions: IUser[];
    isEdited: boolean;
    moderationStatus?: "pending" | "approved" | "rejected";
    createdAt: string;
    updatedAt: string;
    // Only on aggregated responses (lists and GET /post/:id), not on create/like/repost responses
    likeCount?: number;
    commentCount?: number;
    repostCount?: number;
    isLiked?: boolean;
    isReposted?: boolean;
}

/** The list endpoints' envelope */
export interface IPaginated<T> {
    message?: string;
    data: T[];
    page: number;
    limit: number;
    totalPages: number;
}
