import { useMemo } from "react";

import { usePagination } from "@/hooks/use-pagination";
import { reelFeedUrl } from "@/services/reels";
import { IReel } from "@/types/reel";

/**
 * The ranked reel feed. The ranking shifts between pages, so a reel can come back on a later page: keep the first
 * copy. `first` (a reel opened by link) leads and is excluded from the feed.
 */
export function useReelFeed(first?: IReel | null) {
    const feed = usePagination<IReel>(reelFeedUrl(first?._id));

    const reels = useMemo(() => {
        const seen = new Set<string>();
        return [...(first ? [first] : []), ...feed.items].filter((reel) => !seen.has(reel._id) && !!seen.add(reel._id));
    }, [first, feed.items]);

    return { ...feed, reels };
}
