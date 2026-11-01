import { IUser } from "./user";

// Mirrors client/src/types/comment.ts
export interface IComment {
    _id: string;
    /** The top-level comment of a thread; null on top-level comments */
    rootComment: string | null;
    /** The comment being replied to (the web sends a comment id, though the model calls it a user ref) */
    replyTo: string | null;
    targetType: "Post" | "Reel";
    target: string;
    /** HTML, like post captions */
    content: string;
    commentBy: IUser;
    likes: string[];
    tags: string[];
    mentions: IUser[];
    isEdited: boolean;
    createdAt: string;
    updatedAt: string;
    replyCount?: number;
    likeCount?: number;
}
