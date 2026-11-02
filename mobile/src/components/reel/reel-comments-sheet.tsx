import { X } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Animated, FlatList, Modal, PanResponder, Pressable, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useSWR from "swr";

import { CommentForm } from "@/components/comment/comment-form";
import { CommentItem } from "@/components/comment/comment-item";
import { Button, Divider, Text } from "@/components/ui";
import { useAnimatedValue } from "@/hooks/use-animated-value";
import { useKeyboardHeight } from "@/hooks/use-keyboard-height";
import { usePagination } from "@/hooks/use-pagination";
import { fetcher } from "@/lib/http";
import { commentsUrl } from "@/services/comments";
import { useReelCounters } from "@/stores/reel-store";
import { radius, spacing, useTheme } from "@/theme";
import { CommentTarget, IComment } from "@/types/comment";
import { IReel } from "@/types/reel";

/** TikTok's split: the sheet takes the bottom 60%, the video keeps playing in the top 40% */
export const COMMENTS_SHEET_RATIO = 0.6;
/** Dragged this far down (or flicked), the sheet closes */
const CLOSE_DRAG = 120;

type ReelCommentsSheetProps = {
    reel: IReel;
    isOpen: boolean;
    onClose: () => void;
    /** Opened from a notification: this thread is pinned on top */
    focusCommentId?: string;
};

/** The reel's comments in a bottom sheet over the video, loaded only once it's opened */
export function ReelCommentsSheet({ reel, isOpen, onClose, focusCommentId }: ReelCommentsSheetProps) {
    return (
        <Modal visible={isOpen} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
            {/* Mounted while open, so comments load on first open and the field starts empty */}
            {isOpen ? <CommentsContent reel={reel} onClose={onClose} focusCommentId={focusCommentId} /> : null}
        </Modal>
    );
}

function CommentsContent({ reel, onClose, focusCommentId }: Omit<ReelCommentsSheetProps, "isOpen">) {
    const { t } = useTranslation(["reel", "comment"]);
    const { colors, shadows } = useTheme();
    const insets = useSafeAreaInsets();
    const { height: windowHeight } = useWindowDimensions();
    // iOS only; Android resizes the window for the keyboard itself
    const keyboardHeight = useKeyboardHeight();
    const { commentCount } = useReelCounters(reel);
    const [replyTo, setReplyTo] = useState<IComment | null>(null);
    const drag = useDragToClose(onClose);

    const target = useMemo<CommentTarget>(() => ({ type: "Reel", id: reel._id, ownerId: reel.reelBy._id, commentCount: reel.commentCount }), [reel]);
    const comments = usePagination<IComment>(commentsUrl(target));
    const { data: focused } = useSWR<{ data: IComment }>(focusCommentId ? `/comment/${focusCommentId}` : null, fetcher);
    const pinned = focused?.data;
    const items = pinned ? comments.items.filter((comment) => comment._id !== pinned._id) : comments.items;

    // Typing: the sheet grows by the keyboard so the comments above the field stay in view
    const sheetHeight = Math.min(windowHeight * COMMENTS_SHEET_RATIO + keyboardHeight, windowHeight - insets.top - spacing[4]);

    const renderComment = useCallback(
        ({ item }: { item: IComment }) => (
            <View style={{ paddingHorizontal: spacing[4] }}>
                <CommentItem comment={item} target={target} onReply={setReplyTo} />
            </View>
        ),
        [target],
    );

    return (
        <View style={{ flex: 1 }}>
            {/* The video's part of the screen: tapping it closes the sheet */}
            <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} style={{ flex: 1 }} />

            <Animated.View
                style={{
                    height: sheetHeight,
                    borderTopLeftRadius: radius.large,
                    borderTopRightRadius: radius.large,
                    backgroundColor: colors.background,
                    boxShadow: shadows.large,
                    overflow: "hidden",
                    transform: [{ translateY: drag.offset }],
                }}
            >
                <View {...drag.panHandlers}>
                    <View
                        style={{
                            alignSelf: "center",
                            width: 36,
                            height: 4,
                            borderRadius: radius.full,
                            backgroundColor: colors.default300,
                            marginTop: spacing[2],
                        }}
                    />
                    <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing[2], minHeight: 44 }}>
                        <View style={{ width: 40 }} />
                        <Text weight={600} style={{ flex: 1, textAlign: "center" }} accessibilityRole="header">
                            {t("REEL_COMMENTS")}
                            {commentCount > 0 ? <Text color="default500"> {commentCount}</Text> : null}
                        </Text>
                        <Button isIconOnly variant="light" color="default" radius="full" accessibilityLabel="Close" onPress={onClose}>
                            <X size={22} color={colors.foreground} />
                        </Button>
                    </View>
                </View>
                <Divider />

                <View style={{ flex: 1, paddingBottom: keyboardHeight }}>
                    <FlatList
                        data={items}
                        keyExtractor={(comment) => comment._id}
                        renderItem={renderComment}
                        keyboardShouldPersistTaps="handled"
                        style={{ flex: 1 }}
                        contentContainerStyle={{ paddingVertical: spacing[2] }}
                        ListHeaderComponent={
                            pinned ? (
                                <View style={{ paddingHorizontal: spacing[4], backgroundColor: colors.content2 }}>
                                    <CommentItem comment={pinned} target={target} onReply={setReplyTo} />
                                </View>
                            ) : undefined
                        }
                        onEndReached={comments.loadMore}
                        onEndReachedThreshold={0.5}
                        ListEmptyComponent={
                            comments.isLoading ? (
                                <ActivityIndicator style={{ padding: spacing[6] }} color={colors.default500} />
                            ) : pinned ? undefined : (
                                <Text variant="small" color="default500" style={{ textAlign: "center", padding: spacing[6] }}>
                                    {t("comment:COMMENT_EMPTY")}
                                </Text>
                            )
                        }
                        ListFooterComponent={
                            comments.isLoadingMore && comments.items.length > 0 ? (
                                <ActivityIndicator style={{ padding: spacing[4] }} color={colors.default500} />
                            ) : undefined
                        }
                    />
                    <CommentForm target={target} replyTo={replyTo} onCancelReply={() => setReplyTo(null)} />
                </View>
            </Animated.View>
        </View>
    );
}

/** Drag the sheet's handle/header down to close it; a short drag springs back */
function useDragToClose(onClose: () => void) {
    const offset = useAnimatedValue(0);

    // `onClose` must be stable: a new responder mid-drag would drop the gesture
    const responder = useMemo(
        () =>
            PanResponder.create({
                // Taps go to the close button; only a downward drag takes over
                onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 4 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
                onPanResponderMove: (_, gesture) => offset.setValue(Math.max(0, gesture.dy)),
                onPanResponderRelease: (_, gesture) => {
                    if (gesture.dy > CLOSE_DRAG || gesture.vy > 1) onClose();
                    else Animated.spring(offset, { toValue: 0, useNativeDriver: true }).start();
                },
                onPanResponderTerminate: () => Animated.spring(offset, { toValue: 0, useNativeDriver: true }).start(),
            }),
        [offset, onClose]
    );

    return { offset, panHandlers: responder.panHandlers };
}
