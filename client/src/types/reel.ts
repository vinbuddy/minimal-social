import { IUser } from "./user";

export type IReelUser = Pick<IUser, "_id" | "username" | "photo" | "isVerified">;

export interface IReelVideo {
    publicId: string;
    url: string;
    thumbnailUrl: string;
    width: number;
    height: number;
    duration: number;
}

export interface IAudio {
    _id: string;
    // null means "Original audio"
    title: string | null;
    owner: IReelUser;
    sourceReel: string | null;
    url: string;
    coverUrl: string;
    duration: number;
    reelCount: number;
    createdAt: string;
    // Computed by the API for the current user
    isSaved?: boolean;
}

export interface IReel {
    _id: string;
    reelBy: IReelUser;
    caption: string;
    video: IReelVideo;
    audio: IAudio | null;
    mentions: string[];
    tags: string[];
    likeCount: number;
    commentCount: number;
    viewCount: number;
    // Only the author ever receives a pending reel
    moderationStatus: "pending" | "approved";
    createdAt: string;
    updatedAt: string;
    // Computed by the API for the current user
    isLiked: boolean;
    isFollowing: boolean;
}

export interface IReelUploadSignature {
    publicId: string;
    timestamp: number;
    signature: string;
    apiKey: string;
    cloudName: string;
    maxDuration: number;
    maxBytes: number;
}
