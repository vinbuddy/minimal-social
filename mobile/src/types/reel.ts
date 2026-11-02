import { IUser } from "./user";

// Mirrors the server's reel card (server/src/modules/reels/reel.service.ts, reelCardStages)

export type IReelAuthor = Pick<IUser, "_id" | "username" | "photo" | "isVerified">;

export interface IReelVideo {
    publicId: string;
    /** 720p MP4, with the reel's audio laid over when it reuses another reel's sound */
    url: string;
    /** The first frame */
    thumbnailUrl: string;
    width: number;
    height: number;
    /** Seconds */
    duration: number;
}

export interface IReelAudio {
    _id: string;
    /** null means the reel's original sound ("Original audio") */
    title: string | null;
    owner: IReelAuthor;
    sourceReel: string | null;
    /** MP3 */
    url: string;
    coverUrl: string;
    duration: number;
    reelCount: number;
    /** Only on GET /reel/audio/:id */
    isSaved?: boolean;
}

export interface IReel {
    _id: string;
    video: IReelVideo;
    /** HTML, like post captions */
    caption: string;
    reelBy: IReelAuthor;
    /** Ids, not populated */
    mentions: string[];
    tags: string[];
    audio: IReelAudio | null;
    likeCount: number;
    commentCount: number;
    viewCount: number;
    /** Pending reels are seen only by their author until moderation approves them */
    moderationStatus: "pending" | "approved";
    isLiked: boolean;
    isFollowing: boolean;
    createdAt: string;
    updatedAt: string;
}

/** POST /reel/upload-signature: a signed direct upload to Cloudinary */
export interface IReelUploadSignature {
    publicId: string;
    timestamp: number;
    signature: string;
    apiKey: string;
    cloudName: string;
    /** Seconds */
    maxDuration: number;
    maxBytes: number;
}
