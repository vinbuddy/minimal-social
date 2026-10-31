import { create } from "zustand";

interface ReelState {
    // Shared by every reel, so unmuting once keeps sound on while scrolling
    muted: boolean;
    toggleMuted: () => void;
    // Reels already counted as viewed in this session
    viewedReelIds: Set<string>;
    markViewed: (reelId: string) => boolean;
}

const useReelStore = create<ReelState>((set, get) => ({
    muted: true,
    toggleMuted: () => set((state) => ({ muted: !state.muted })),
    viewedReelIds: new Set<string>(),
    markViewed: (reelId: string): boolean => {
        const { viewedReelIds } = get();
        if (viewedReelIds.has(reelId)) return false;

        viewedReelIds.add(reelId);
        return true;
    },
}));

export default useReelStore;
