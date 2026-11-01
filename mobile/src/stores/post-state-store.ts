import { create } from "zustand";

import { IPost } from "@/types/post";

export type PostCounters = Pick<Required<IPost>, "isLiked" | "likeCount" | "isReposted" | "repostCount" | "commentCount">;

type PostStateStore = {
    /** Changes made on this device since a post was fetched, by post id */
    overrides: Record<string, Partial<PostCounters>>;
    patch: (postId: string, change: Partial<PostCounters>) => void;
    /** Drop local changes once fresh data has been fetched */
    reset: () => void;
};

/**
 * Keeps likes, reposts and comment counts consistent between the feed and the post detail screen without
 * refetching every list after each tap (the web re-reads its local state per component instead).
 */
export const usePostStateStore = create<PostStateStore>((set) => ({
    overrides: {},
    patch: (postId, change) => set((state) => ({ overrides: { ...state.overrides, [postId]: { ...state.overrides[postId], ...change } } })),
    reset: () => set({ overrides: {} }),
}));

export function usePostCounters(post: IPost): PostCounters {
    const override = usePostStateStore((state) => state.overrides[post._id]);

    return {
        isLiked: override?.isLiked ?? post.isLiked ?? false,
        likeCount: override?.likeCount ?? post.likeCount ?? 0,
        isReposted: override?.isReposted ?? post.isReposted ?? false,
        repostCount: override?.repostCount ?? post.repostCount ?? 0,
        commentCount: override?.commentCount ?? post.commentCount ?? 0,
    };
}
