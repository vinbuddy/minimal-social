import { useIsFocused } from "expo-router";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { ActivityIndicator, AppState, FlatList, FlatListProps, View } from "react-native";

import { IReel } from "@/types/reel";
import { ReelItem } from "./reel-item";

type ReelFeedProps = {
    reels: IReel[];
    isLoading: boolean;
    onEndReached: () => void;
    /** Drawn over the top of the reels: the screen's title and buttons */
    overlay?: ReactNode;
    /** Shown when there are no reels */
    empty?: ReactNode;
    /** Opened from a notification: the first reel opens its comments on this one */
    focusCommentId?: string;
};

/**
 * Full-screen reels, one per swipe, like the web's snap-scrolling feed: the reel mostly on screen plays, its
 * neighbours keep a player ready, the rest show their first frame. Nothing plays when the screen or app isn't in front.
 */
export function ReelFeed({ reels, isLoading, onEndReached, overlay, empty, focusCommentId }: ReelFeedProps) {
    const [height, setHeight] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    // Paused by a tap; swiping to another reel plays again
    const [pausedId, setPausedId] = useState<string | null>(null);
    const [deletedIds, setDeletedIds] = useState<string[]>([]);
    const isScreenFocused = useIsFocused();
    const isAppActive = useAppIsActive();
    const isPlaying = isScreenFocused && isAppActive;

    const visible = deletedIds.length > 0 ? reels.filter((reel) => !deletedIds.includes(reel._id)) : reels;

    // Stable: FlatList doesn't support changing this callback
    const onViewableItemsChanged = useCallback<NonNullable<FlatListProps<IReel>["onViewableItemsChanged"]>>(({ viewableItems }) => {
        const index = viewableItems[0]?.index;
        if (index === null || index === undefined) return;
        setActiveIndex(index);
        setPausedId(null);
    }, []);

    const onDeleted = useCallback((reelId: string) => setDeletedIds((ids) => [...ids, reelId]), []);

    return (
        <View style={{ flex: 1, backgroundColor: "#000000" }} onLayout={(event) => setHeight(event.nativeEvent.layout.height)}>
            {height > 0 ? (
                isLoading && visible.length === 0 ? (
                    <ActivityIndicator style={{ flex: 1 }} color="#ffffff" />
                ) : visible.length === 0 ? (
                    empty
                ) : (
                    <FlatList
                        data={visible}
                        keyExtractor={(reel) => reel._id}
                        renderItem={({ item, index }) => (
                            <ReelItem
                                reel={item}
                                height={height}
                                isActive={index === activeIndex && isPlaying}
                                isNear={Math.abs(index - activeIndex) <= 1}
                                isPaused={pausedId === item._id}
                                onTogglePause={() => setPausedId((current) => (current === item._id ? null : item._id))}
                                onDeleted={onDeleted}
                                focusCommentId={index === 0 ? focusCommentId : undefined}
                            />
                        )}
                        extraData={`${activeIndex}-${pausedId}-${isPlaying}`}
                        getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
                        pagingEnabled
                        snapToInterval={height}
                        snapToAlignment="start"
                        decelerationRate="fast"
                        disableIntervalMomentum
                        showsVerticalScrollIndicator={false}
                        onViewableItemsChanged={onViewableItemsChanged}
                        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
                        windowSize={3}
                        initialNumToRender={2}
                        maxToRenderPerBatch={2}
                        // Load the next page three reels before the end, as the web does
                        onEndReached={onEndReached}
                        onEndReachedThreshold={3}
                    />
                )
            ) : null}
            {overlay}
        </View>
    );
}

/** False while the app is in the background, so the playing reel stops */
function useAppIsActive() {
    const [isActive, setIsActive] = useState(AppState.currentState !== "background");

    useEffect(() => {
        const subscription = AppState.addEventListener("change", (state) => setIsActive(state === "active"));
        return () => subscription.remove();
    }, []);

    return isActive;
}
