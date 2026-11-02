import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Clock, Link2, MoreHorizontal, Music2, Send, Trash2, UserRound } from "lucide-react-native";
import { memo, ReactNode, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Easing, Pressable, Share, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CommentIcon, HeartIcon, VerifiedIcon } from "@/components/icons";
import { RichText } from "@/components/rich-text";
import { ActionSheet, ActionSheetOption, Avatar, Text, toast } from "@/components/ui";
import { useAnimatedValue } from "@/hooks/use-animated-value";
import { confirm } from "@/lib/confirm";
import { formatCompactNumber } from "@/lib/format";
import { invalidate } from "@/lib/invalidate";
import { getErrorMessage } from "@/services/auth";
import { notify } from "@/services/notifications";
import { deleteReel, likeReel, reelWebUrl, unlikeReel, viewReel } from "@/services/reels";
import { followUser } from "@/services/users";
import useAuthStore from "@/stores/auth-store";
import { useFollowStore, useIsFollowing } from "@/stores/follow-store";
import { useReelCounters, useReelStore } from "@/stores/reel-store";
import { radius, spacing, useTheme } from "@/theme";
import { IReel } from "@/types/reel";
import { COMMENTS_SHEET_RATIO, ReelCommentsSheet } from "./reel-comments-sheet";
import { ReelPlayer } from "./reel-player";

const WHITE = "#ffffff";
/** Keeps white text readable over bright frames */
const TEXT_SHADOW = { textShadowColor: "rgba(0, 0, 0, 0.6)", textShadowRadius: 4, textShadowOffset: { width: 0, height: 1 } };
const VIEW_AFTER_MS = 2000;
/** Views sent this session, so swiping back doesn't send another (the server counts one per person anyway) */
const viewed = new Set<string>();

type ReelItemProps = {
    reel: IReel;
    height: number;
    isActive: boolean;
    isNear: boolean;
    isPaused: boolean;
    onTogglePause: () => void;
    onDeleted: (reelId: string) => void;
    /** Opened from a notification: show this comment's thread */
    focusCommentId?: string;
};

/** One full-screen reel: the video, who posted it with the caption and audio, and the like/comment/share column */
export const ReelItem = memo(function ReelItem({ reel, height, isActive, isNear, isPaused, onTogglePause, onDeleted, focusCommentId }: ReelItemProps) {
    const { t } = useTranslation(["reel", "common", "app"]);
    const { colors } = useTheme();
    const currentUser = useAuthStore((state) => state.currentUser);
    const patch = useReelStore((state) => state.patch);
    const { isLiked, likeCount, commentCount } = useReelCounters(reel);
    const [isCommentsOpen, setIsCommentsOpen] = useState(!!focusCommentId);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const closeComments = useCallback(() => setIsCommentsOpen(false), []);
    const commentsProgress = useCommentsProgress(isCommentsOpen);
    const videoFrame = useVideoFrameAboveSheet(height);

    const isOwner = currentUser?._id === reel.reelBy._id;
    const webUrl = reelWebUrl(reel._id);

    useEffect(() => {
        if (!isActive || viewed.has(reel._id)) return;
        const timer = setTimeout(() => {
            viewed.add(reel._id);
            viewReel(reel._id).catch(() => viewed.delete(reel._id));
        }, VIEW_AFTER_MS);
        return () => clearTimeout(timer);
    }, [isActive, reel._id]);

    const setLiked = async (next: boolean) => {
        patch(reel._id, { isLiked: next, likeCount: Math.max(0, likeCount + (next ? 1 : -1)) });
        try {
            const count = await (next ? likeReel(reel._id) : unlikeReel(reel._id));
            patch(reel._id, { likeCount: count });
            if (next) {
                notify(currentUser, {
                    target: reel._id,
                    targetType: "Reel",
                    action: "like",
                    message: t("REEL_LIKED_YOUR_REEL"),
                    receivers: [reel.reelBy._id],
                    url: `/reels/${reel._id}`,
                });
            }
        } catch (error) {
            patch(reel._id, { isLiked: !next, likeCount });
            toast.error(getErrorMessage(error));
        }
    };

    const remove = async () => {
        const ok = await confirm({
            title: t("REEL_MENU.DELETE_CONFIRM_TITLE"),
            message: t("REEL_MENU.DELETE_CONFIRM"),
            confirmLabel: t("common:DELETE"),
            cancelLabel: t("common:CANCEL"),
            destructive: true,
        });
        if (!ok) return;
        try {
            await deleteReel(reel._id);
            toast.success(t("REEL_DELETED_SUCCESS"));
            onDeleted(reel._id);
            invalidate("/reel");
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    const openProfile = () => router.push({ pathname: "/profile/[id]", params: { id: reel.reelBy._id } });
    const openAudio = () => reel.audio && router.push({ pathname: "/reels/audio/[id]", params: { id: reel.audio._id } });

    const menuOptions: ActionSheetOption[] = [
        ...(webUrl
            ? [
                  {
                      label: t("REEL_MENU.COPY_LINK"),
                      icon: Link2,
                      onPress: async () => {
                          await Clipboard.setStringAsync(webUrl);
                          toast.success(t("common:COPIED_TO_CLIPBOARD"));
                      },
                  },
              ]
            : []),
        ...(reel.audio ? [{ label: t("REEL_MENU.GO_TO_AUDIO"), icon: Music2, onPress: openAudio }] : []),
        { label: t("REEL_MENU.VIEW_PROFILE"), icon: UserRound, onPress: openProfile },
        ...(isOwner || currentUser?.isAdmin ? [{ label: t("REEL_MENU.DELETE"), icon: Trash2, destructive: true, onPress: remove }] : []),
    ];

    return (
        <View style={{ height, backgroundColor: "#000000", overflow: "hidden" }}>
            {/* With comments open the video shrinks into the space above the sheet and keeps playing, as on TikTok */}
            <Animated.View
                style={{
                    flex: 1,
                    transform: [
                        { translateY: commentsProgress.interpolate({ inputRange: [0, 1], outputRange: [0, videoFrame.translateY] }) },
                        { scale: commentsProgress.interpolate({ inputRange: [0, 1], outputRange: [1, videoFrame.scale] }) },
                    ],
                }}
            >
                <ReelPlayer
                    reel={reel}
                    isActive={isActive}
                    isNear={isNear}
                    isPaused={isPaused}
                    onTogglePause={onTogglePause}
                    // A double tap only likes, as on the web; it never unlikes
                    onDoubleTap={() => !isLiked && setLiked(true)}
                />
            </Animated.View>

            <Animated.View
                pointerEvents={isCommentsOpen ? "none" : "box-none"}
                style={{ position: "absolute", inset: 0, opacity: commentsProgress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }}
            >
                {reel.moderationStatus === "pending" ? (
                    <View
                        accessibilityHint={t("REEL_PENDING_HINT")}
                        style={{
                            position: "absolute",
                            top: 64,
                            left: spacing[4],
                            flexDirection: "row",
                            alignItems: "center",
                            gap: spacing[1],
                            paddingHorizontal: spacing[2],
                            paddingVertical: spacing[1],
                            borderRadius: radius.full,
                            backgroundColor: "rgba(0, 0, 0, 0.55)",
                        }}
                    >
                        <Clock size={14} color={WHITE} />
                        <Text variant="tiny" weight={600} style={{ color: WHITE }}>
                            {t("REEL_PENDING")}
                        </Text>
                    </View>
                ) : null}

                {/* Bottom-left: author, caption, audio */}
                <View pointerEvents="box-none" style={{ position: "absolute", left: spacing[4], right: 72, bottom: spacing[4], gap: spacing[2] }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[2] }}>
                        <Pressable
                            accessibilityRole="link"
                            onPress={openProfile}
                            style={{ flexDirection: "row", alignItems: "center", gap: spacing[2], flexShrink: 1 }}
                        >
                            <Avatar size="sm" src={reel.reelBy.photo} name={reel.reelBy.username} />
                            <Text weight={600} numberOfLines={1} style={{ color: WHITE, flexShrink: 1, ...TEXT_SHADOW }}>
                                {reel.reelBy.username}
                            </Text>
                            {reel.reelBy.isVerified ? <VerifiedIcon size={14} /> : null}
                        </Pressable>
                        {!isOwner ? <FollowChip reel={reel} /> : null}
                    </View>

                    {reel.caption ? <Caption html={reel.caption} /> : null}

                    {reel.audio ? (
                        <Pressable
                            accessibilityRole="link"
                            onPress={openAudio}
                            style={{ flexDirection: "row", alignItems: "center", gap: spacing[1], alignSelf: "flex-start", maxWidth: "100%" }}
                        >
                            <Music2 size={14} color={WHITE} />
                            <Text variant="small" numberOfLines={1} style={{ color: WHITE, flexShrink: 1, ...TEXT_SHADOW }}>
                                {reel.audio.owner.username} · {reel.audio.title ?? t("AUDIO.ORIGINAL")}
                            </Text>
                        </Pressable>
                    ) : null}
                </View>

                {/* Right column: like, comment, share, more, audio */}
                <View
                    pointerEvents="box-none"
                    style={{ position: "absolute", right: spacing[2], bottom: spacing[4], alignItems: "center", gap: spacing[4], width: 56 }}
                >
                    <ActionButton
                        label={isLiked ? "Unlike" : t("common:LIKE")}
                        count={likeCount > 0 ? formatCompactNumber(likeCount) : t("REEL_LIKES")}
                        onPress={() => setLiked(!isLiked)}
                    >
                        <HeartIcon size={30} filled={isLiked} color={isLiked ? colors.like : WHITE} />
                    </ActionButton>
                    <ActionButton
                        label={t("common:COMMENT")}
                        count={commentCount > 0 ? formatCompactNumber(commentCount) : undefined}
                        onPress={() => setIsCommentsOpen(true)}
                    >
                        <CommentIcon size={28} color={WHITE} />
                    </ActionButton>
                    {webUrl ? (
                        <ActionButton label={t("REEL_SHARE")} onPress={() => Share.share({ message: webUrl, url: webUrl })}>
                            <Send size={26} color={WHITE} />
                        </ActionButton>
                    ) : null}
                    <ActionButton label={t("REEL_MORE_OPTIONS")} onPress={() => setIsMenuOpen(true)}>
                        <MoreHorizontal size={26} color={WHITE} />
                    </ActionButton>
                    {reel.audio ? (
                        <Pressable accessibilityRole="link" accessibilityLabel={t("AUDIO.TITLE")} onPress={openAudio}>
                            <Image
                                source={{ uri: reel.audio.coverUrl || reel.audio.owner.photo }}
                                style={{ width: 32, height: 32, borderRadius: radius.small, borderWidth: 2, borderColor: WHITE }}
                                contentFit="cover"
                            />
                        </Pressable>
                    ) : null}
                </View>
            </Animated.View>

            <ReelCommentsSheet reel={reel} isOpen={isCommentsOpen} onClose={closeComments} focusCommentId={focusCommentId} />
            <ActionSheet isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} options={menuOptions} />
        </View>
    );
});

/** 0 → 1 as the comments sheet opens */
function useCommentsProgress(isOpen: boolean) {
    const progress = useAnimatedValue(isOpen ? 1 : 0);

    useEffect(() => {
        Animated.timing(progress, { toValue: isOpen ? 1 : 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    }, [isOpen, progress]);

    return progress;
}

/** Scale and offset that fit a full-height reel between the status bar and the top of the comments sheet */
function useVideoFrameAboveSheet(reelHeight: number) {
    const { height: windowHeight } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const available = windowHeight * (1 - COMMENTS_SHEET_RATIO) - insets.top;
    const scale = Math.min(1, available / reelHeight);
    // Scaling is around the centre: move the shrunk video up to sit under the status bar
    return { scale, translateY: insets.top - (reelHeight * (1 - scale)) / 2 };
}

function ActionButton({ label, count, onPress, children }: { label: string; count?: string; onPress: () => void; children: ReactNode }) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={label}
            hitSlop={6}
            onPress={onPress}
            style={({ pressed }) => ({ alignItems: "center", gap: 2, opacity: pressed ? 0.7 : 1 })}
        >
            {children}
            {count ? (
                <Text variant="tiny" weight={600} style={{ color: WHITE, ...TEXT_SHADOW }}>
                    {count}
                </Text>
            ) : null}
        </Pressable>
    );
}

/** Two lines, then "… more" expands it, as on the web */
function Caption({ html }: { html: string }) {
    const { t } = useTranslation("reel");
    const [isExpanded, setIsExpanded] = useState(false);
    const [isClamped, setIsClamped] = useState(false);

    return (
        <Pressable accessibilityRole="button" disabled={!isClamped && !isExpanded} onPress={() => setIsExpanded((value) => !value)}>
            <RichText
                html={html}
                variant="small"
                linkColor={WHITE}
                numberOfLines={isExpanded ? undefined : 2}
                onTextLayout={(event) => !isExpanded && setIsClamped(event.nativeEvent.lines.length > 2)}
                style={{ color: WHITE, ...TEXT_SHADOW }}
            />
            {isClamped || isExpanded ? (
                <Text variant="small" weight={600} style={{ color: "rgba(255, 255, 255, 0.8)", ...TEXT_SHADOW }}>
                    {isExpanded ? t("REEL_LESS") : t("REEL_MORE")}
                </Text>
            ) : null}
        </Pressable>
    );
}

/** Instagram's inline Follow beside the name; gone once you follow */
function FollowChip({ reel }: { reel: IReel }) {
    const { t } = useTranslation("user");
    const currentUser = useAuthStore((state) => state.currentUser);
    const setFollowing = useFollowStore((state) => state.setFollowing);
    const isFollowing = useIsFollowing(reel.reelBy._id, reel.isFollowing);
    if (isFollowing || !currentUser) return null;

    const follow = async () => {
        setFollowing(reel.reelBy._id, true);
        try {
            await followUser(reel.reelBy._id);
            notify(currentUser, {
                target: reel.reelBy._id,
                targetType: "User",
                action: "follow",
                message: "followed you",
                receivers: [reel.reelBy._id],
                url: `/profile/${currentUser._id}`,
            });
            invalidate("/user");
        } catch (error) {
            setFollowing(reel.reelBy._id, false);
            toast.error(getErrorMessage(error));
        }
    };

    return (
        <Pressable
            accessibilityRole="button"
            onPress={follow}
            style={({ pressed }) => ({
                paddingHorizontal: spacing[3],
                paddingVertical: 4,
                borderRadius: radius.small,
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.8)",
                opacity: pressed ? 0.7 : 1,
            })}
        >
            <Text variant="tiny" weight={600} style={{ color: WHITE }}>
                {t("USER.FOLLOW")}
            </Text>
        </Pressable>
    );
}
