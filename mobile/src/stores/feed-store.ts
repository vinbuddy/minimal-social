import { create } from "zustand";

import { FeedType } from "@/services/posts";

type FeedStore = {
    feedType: FeedType;
    isDrawerOpen: boolean;
    selectFeed: (feedType: FeedType) => void;
    openDrawer: () => void;
    closeDrawer: () => void;
};

/** The feed shown on Home and the Threads-style drawer that picks it (the drawer lives in the tabs layout) */
export const useFeedStore = create<FeedStore>((set) => ({
    feedType: "feed",
    isDrawerOpen: false,
    selectFeed: (feedType) => set({ feedType, isDrawerOpen: false }),
    openDrawer: () => set({ isDrawerOpen: true }),
    closeDrawer: () => set({ isDrawerOpen: false }),
}));
