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

/** What a comment thread belongs to: a post or a reel (the server's polymorphic `targetType`) */
export type CommentTarget = {
    type: "Post" | "Reel";
    id: string;
    /** The post's or reel's author, who can delete any comment on it and is notified of new ones */
    ownerId: string;
    /** The count from the server, before changes made on this device */
    commentCount: number;
};
