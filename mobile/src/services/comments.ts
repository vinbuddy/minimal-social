import http from "@/lib/http";
import { CommentTarget, IComment } from "@/types/comment";

export const commentsUrl = (target: Pick<CommentTarget, "type" | "id">) => `/comment?targetType=${target.type}&target=${target.id}`;
export const repliesUrl = (rootCommentId: string) => `/comment/reply?rootComment=${rootCommentId}`;

/** A reply carries the comment it answers and its thread's root, as the web sends them */
export async function createComment(input: { target: Pick<CommentTarget, "type" | "id">; content: string; replyTo?: IComment | null }) {
    const { target, content, replyTo } = input;
    const res = await http.post<{ data: IComment }>("/comment", {
        target: target.id,
        // The server defaults to "Post", so a reel comment must say so
        targetType: target.type,
        content,
        ...(replyTo ? { replyTo: replyTo._id, rootComment: replyTo.rootComment ?? replyTo._id } : {}),
    });
    return res.data.data;
}

export async function likeComment(commentId: string) {
    await http.put("/comment/like", { commentId });
}

export async function unlikeComment(commentId: string) {
    await http.put("/comment/unlike", { commentId });
}

export async function deleteComment(commentId: string) {
    await http.delete(`/comment/${commentId}`);
}
