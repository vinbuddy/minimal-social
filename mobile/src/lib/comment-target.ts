import { usePostStateStore } from "@/stores/post-state-store";
import { useReelStore } from "@/stores/reel-store";
import { CommentTarget } from "@/types/comment";

/** Adds `delta` to the post's or reel's comment count shown everywhere on this device */
export function adjustCommentCount(target: CommentTarget, delta: number) {
    const store = target.type === "Post" ? usePostStateStore.getState() : useReelStore.getState();
    const current = store.overrides[target.id]?.commentCount ?? target.commentCount;
    store.patch(target.id, { commentCount: Math.max(0, current + delta) });
}

/** The web route a comment opens at, used in notifications */
export function commentWebUrl(target: CommentTarget, commentId: string, rootCommentId?: string | null) {
    const base = target.type === "Post" ? `/post/${target.id}` : `/reels/${target.id}`;
    return `${base}?commentId=${commentId}${rootCommentId ? `&rootComment=${rootCommentId}` : ""}`;
}
