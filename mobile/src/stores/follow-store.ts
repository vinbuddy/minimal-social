import { create } from "zustand";

type FollowStore = {
    /** Follows changed on this device since the users were fetched, by user id */
    overrides: Record<string, boolean>;
    setFollowing: (userId: string, isFollowing: boolean) => void;
};

/** Keeps a Follow button in a list and the same user's profile in step, like post-state-store does for likes */
export const useFollowStore = create<FollowStore>((set) => ({
    overrides: {},
    setFollowing: (userId, isFollowing) => set((state) => ({ overrides: { ...state.overrides, [userId]: isFollowing } })),
}));

export function useIsFollowing(userId: string, fromServer: boolean | undefined) {
    const override = useFollowStore((state) => state.overrides[userId]);
    return override ?? fromServer ?? false;
}
