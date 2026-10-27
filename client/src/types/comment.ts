import { IPost } from "./post";
import { IUser } from "./user";

export interface IComment {
    _id: string;
    rootComment: string;
    replyTo: string;
    targetType: "Post" | "Reel";
    target: string;
    content: string;
    commentBy: IUser;
    likes: any[];
    tags: string[];
    mentions: IUser[];
    isEdited: boolean;
    createdAt: string;
    updatedAt: string;
    replyCount: number;
    likeCount: number;
}
