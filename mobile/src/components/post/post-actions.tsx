import { router } from "expo-router";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { CommentIcon, HeartIcon, RepostIcon } from "@/components/icons";
import { Text, toast } from "@/components/ui";
import { invalidate } from "@/lib/invalidate";
import { getErrorMessage } from "@/services/auth";
import { notify } from "@/services/notifications";
import { likePost, repost, unlikePost, unrepost } from "@/services/posts";
import useAuthStore from "@/stores/auth-store";
import { usePostCounters, usePostStateStore } from "@/stores/post-state-store";
import { radius, spacing, useTheme } from "@/theme";
import { IPost } from "@/types/post";

/**
 * Like, comment and repost pills: bare counts beside 18px icons, `danger` heart when liked, `success` repost.
 * Acts on the post being shown, which is the original for a repost (the web likes the repost wrapper instead,
 * which hides the like from the original's author).
 */
type PostActionsProps = {
    post: IPost;
    /** White ink for the fullscreen media gallery's black ground */
    onMedia?: boolean;
    /** Runs before opening the comments, e.g. to close the gallery */
    onBeforeNavigate?: () => void;
};

export function PostActions({ post, onMedia = false, onBeforeNavigate }: PostActionsProps) {
    const { t } = useTranslation("post");
    const { colors } = useTheme();
    const currentUser = useAuthStore((state) => state.currentUser);
    const patch = usePostStateStore((state) => state.patch);
    const counters = usePostCounters(post);
    const ink = onMedia ? "#ffffff" : colors.foreground;

    const toggleLike = async () => {
        const previous = { isLiked: counters.isLiked, likeCount: counters.likeCount };
        const isLiked = !counters.isLiked;
        patch(post._id, { isLiked, likeCount: Math.max(0, counters.likeCount + (isLiked ? 1 : -1)) });

        try {
            if (isLiked) {
                await likePost(post._id);
                notify(currentUser, {
                    target: post._id,
                    targetType: "Post",
                    action: "like",
                    message: "liked your post",
                    receivers: [post.postBy._id],
                    url: `/post/${post._id}`,
                });
            } else {
                await unlikePost(post._id);
            }
        } catch (error) {
            patch(post._id, previous);
            toast.error(getErrorMessage(error));
        }
    };

    const toggleRepost = async () => {
        const previous = { isReposted: counters.isReposted, repostCount: counters.repostCount };
        const isReposted = !counters.isReposted;
        patch(post._id, { isReposted, repostCount: Math.max(0, counters.repostCount + (isReposted ? 1 : -1)) });

        try {
            if (isReposted) {
                await repost(post._id);
                toast.success(t("POST_REPOSTED"));
                notify(currentUser, {
                    target: post._id,
                    targetType: "Post",
                    action: "repost",
                    message: "reposted your post",
                    receivers: [post.postBy._id],
                    url: `/post/${post._id}`,
                });
            } else {
                await unrepost(post._id);
            }
            // A repost adds or removes a row in the feeds and on profiles
            invalidate("/post");
        } catch (error) {
            patch(post._id, previous);
            toast.error(getErrorMessage(error));
        }
    };

    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[1], marginStart: onMedia ? 0 : -spacing[3] }}>
            <ActionPill onMedia={onMedia} label={counters.likeCount} accessibilityLabel={counters.isLiked ? "Unlike" : "Like"} onPress={toggleLike}>
                <HeartIcon size={18} filled={counters.isLiked} color={counters.isLiked ? colors.danger : ink} />
            </ActionPill>
            <ActionPill
                onMedia={onMedia}
                label={counters.commentCount}
                accessibilityLabel="Comment"
                onPress={() => {
                    onBeforeNavigate?.();
                    router.push({ pathname: "/post/[id]", params: { id: post._id, focus: "comment" } });
                }}
            >
                <CommentIcon size={18} color={ink} />
            </ActionPill>
            <ActionPill onMedia={onMedia} label={counters.repostCount} accessibilityLabel="Repost" onPress={toggleRepost}>
                <RepostIcon size={18} color={counters.isReposted ? colors.success : ink} />
            </ActionPill>
        </View>
    );
}

type ActionPillProps = { children: ReactNode; label: number; onPress: () => void; accessibilityLabel: string; onMedia: boolean };

function ActionPill({ children, label, onPress, accessibilityLabel, onMedia }: ActionPillProps) {
    const { colors } = useTheme();

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${accessibilityLabel}, ${label}`}
            hitSlop={4}
            onPress={onPress}
            style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: spacing[1],
                paddingHorizontal: spacing[3],
                height: 32,
                borderRadius: radius.full,
                backgroundColor: pressed ? (onMedia ? "rgba(255, 255, 255, 0.15)" : colors.content2) : "transparent",
            })}
        >
            {children}
            {label > 0 ? (
                <Text variant="small" color="default600" style={onMedia ? { color: "#ffffff" } : undefined}>
                    {label}
                </Text>
            ) : null}
        </Pressable>
    );
}
