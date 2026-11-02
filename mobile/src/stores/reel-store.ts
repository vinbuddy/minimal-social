import { create } from "zustand";

import { IReel } from "@/types/reel";

export type ReelCounters = Pick<IReel, "isLiked" | "likeCount" | "commentCount">;

type ReelStore = {
    /** One sound setting for every reel, like the web: reels start muted until you unmute one */
    isMuted: boolean;
    setMuted: (isMuted: boolean) => void;
    /** Likes and comment counts changed on this device, by reel id (as post-state-store does for posts) */
    overrides: Record<string, Partial<ReelCounters>>;
    patch: (reelId: string, change: Partial<ReelCounters>) => void;
};

export const useReelStore = create<ReelStore>((set) => ({
    isMuted: true,
    setMuted: (isMuted) => set({ isMuted }),
    overrides: {},
    patch: (reelId, change) => set((state) => ({ overrides: { ...state.overrides, [reelId]: { ...state.overrides[reelId], ...change } } })),
}));

export function useReelCounters(reel: IReel): ReelCounters {
    const override = useReelStore((state) => state.overrides[reel._id]);

    return {
        isLiked: override?.isLiked ?? reel.isLiked,
        likeCount: override?.likeCount ?? reel.likeCount,
        commentCount: override?.commentCount ?? reel.commentCount,
    };
}
