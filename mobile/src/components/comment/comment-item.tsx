import { router } from "expo-router";
import { MoreHorizontal, Trash2 } from "lucide-react-native";
import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, View } from "react-native";

import { HeartIcon } from "@/components/icons";
import { RichText } from "@/components/rich-text";
import { ActionSheet, Avatar, Text, toast, UserName } from "@/components/ui";
import { usePagination } from "@/hooks/use-pagination";
import { confirm } from "@/lib/confirm";
import { formatShortTime } from "@/lib/time";
import { invalidate } from "@/lib/invalidate";
import { getErrorMessage } from "@/services/auth";
import { deleteComment, likeComment, repliesUrl, unlikeComment } from "@/services/comments";
import useAuthStore from "@/stores/auth-store";
import { usePostStateStore } from "@/stores/post-state-store";
import { radius, spacing, useTheme } from "@/theme";
import { IComment } from "@/types/comment";
import { IPost } from "@/types/post";

type CommentItemProps = {
    comment: IComment;
    post: IPost;
    onReply: (comment: IComment) => void;
    /** Replies are one level deep and drawn smaller, as on the web */
    isReply?: boolean;
};

export const CommentItem = memo(function CommentItem({ comment, post, onReply, isReply = false }: CommentItemProps) {
    const { t, i18n } = useTranslation(["comment", "common", "app"]);
    const { colors } = useTheme();
    const currentUser = useAuthStore((state) => state.currentUser);
    const patchPost = usePostStateStore((state) => state.patch);

    const [isLiked, setIsLiked] = useState(() => !!currentUser && comment.likes.includes(currentUser._id));
    const [likeCount, setLikeCount] = useState(comment.likeCount ?? comment.likes.length);
    const [showReplies, setShowReplies] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // The comment's author, the post's author and admins can delete (the server's rule)
    const canDelete = !!currentUser && (comment.commentBy._id === currentUser._id || post.postBy._id === currentUser._id || !!currentUser.isAdmin);
    const openProfile = () => router.push({ pathname: "/profile/[id]", params: { id: comment.commentBy._id } });

    const toggleLike = async () => {
        const next = !isLiked;
        setIsLiked(next);
        setLikeCount((count) => Math.max(0, count + (next ? 1 : -1)));
        try {
            await (next ? likeComment(comment._id) : unlikeComment(comment._id));
        } catch (error) {
            setIsLiked(!next);
            setLikeCount((count) => Math.max(0, count + (next ? -1 : 1)));
            toast.error(getErrorMessage(error));
        }
    };

    const handleDelete = async () => {
        const isConfirmed = await confirm({
            title: t("COMMENT_MENU.DELETE_COMMENT"),
            message: t("COMMENT_MENU.DELETE_COMMENT_CONFIRM"),
            confirmLabel: t("common:DELETE"),
            cancelLabel: t("common:CANCEL"),
            destructive: true,
        });
        if (!isConfirmed) return;

        try {
            await deleteComment(comment._id);
            toast.success(t("COMMENT_MESSAGE.DELETE_COMMENT_SUCCESS"));
            // A top-level comment takes its replies with it
            const removed = 1 + (isReply ? 0 : (comment.replyCount ?? 0));
            const current = usePostStateStore.getState().overrides[post._id]?.commentCount ?? post.commentCount ?? 0;
            patchPost(post._id, { commentCount: Math.max(0, current - removed) });
            invalidate("/comment");
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    const avatarSize = isReply ? "sm" : "md";

    return (
        <View>
            <Pressable onLongPress={canDelete ? () => setIsMenuOpen(true) : undefined} style={{ flexDirection: "row", gap: spacing[3], paddingVertical: spacing[3] }}>
                <Pressable onPress={openProfile} accessibilityRole="link" accessibilityLabel={comment.commentBy.username}>
                    <Avatar size={avatarSize} src={comment.commentBy.photo} name={comment.commentBy.username} />
                </Pressable>

                <View style={{ flex: 1, gap: spacing[1] }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[2] }}>
                        <Pressable onPress={openProfile} style={{ flexShrink: 1 }}>
                            <UserName username={comment.commentBy.username} isVerified={comment.commentBy.isVerified} />
                        </Pressable>
                        <Text variant="tiny" color="default500">
                            {formatShortTime(comment.createdAt, i18n.language)}
                        </Text>
                        <View style={{ flex: 1 }} />
                        {canDelete ? (
                            <Pressable accessibilityRole="button" accessibilityLabel="More" hitSlop={10} onPress={() => setIsMenuOpen(true)}>
                                <MoreHorizontal size={16} color={colors.default500} />
                            </Pressable>
                        ) : null}
                    </View>

                    <RichText html={comment.content} variant="small" />

                    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[4], marginTop: spacing[1] }}>
                        <Pressable accessibilityRole="button" hitSlop={8} onPress={() => onReply(comment)}>
                            <Text variant="tiny" weight={600} color="default500">
                                {t("app:REPLY")}
                            </Text>
                        </Pressable>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`${isLiked ? "Unlike" : "Like"}, ${likeCount}`}
                            hitSlop={8}
                            onPress={toggleLike}
                            style={{ flexDirection: "row", alignItems: "center", gap: spacing[1] }}
                        >
                            <HeartIcon size={14} filled={isLiked} color={isLiked ? colors.danger : colors.default500} />
                            {likeCount > 0 ? (
                                <Text variant="tiny" color="default500">
                                    {likeCount}
                                </Text>
                            ) : null}
                        </Pressable>
                    </View>

                    {!isReply && (comment.replyCount ?? 0) > 0 ? (
                        showReplies ? (
                            <Replies comment={comment} post={post} onReply={onReply} onHide={() => setShowReplies(false)} />
                        ) : (
                            <ViewRepliesButton label={t("COMMENT.VIEW_REPLY_COUNT", { count: comment.replyCount })} onPress={() => setShowReplies(true)} />
                        )
                    ) : null}
                </View>
            </Pressable>

            <ActionSheet
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                options={[{ label: t("COMMENT_MENU.DELETE_COMMENT"), icon: Trash2, destructive: true, onPress: handleDelete }]}
            />
        </View>
    );
});

function Replies({ comment, post, onReply, onHide }: { comment: IComment; post: IPost; onReply: (comment: IComment) => void; onHide: () => void }) {
    const { t } = useTranslation("app");
    const { colors } = useTheme();
    const { items, isLoading, isLoadingMore, isReachedEnd, loadMore } = usePagination<IComment>(repliesUrl(comment._id));

    return (
        <View style={{ marginTop: spacing[1] }}>
            {items.map((reply) => (
                <CommentItem key={reply._id} comment={reply} post={post} onReply={onReply} isReply />
            ))}
            {isLoading || isLoadingMore ? (
                <ActivityIndicator style={{ alignSelf: "flex-start", marginVertical: spacing[2] }} color={colors.default500} />
            ) : !isReachedEnd ? (
                <ViewRepliesButton label="…" onPress={loadMore} />
            ) : (
                <ViewRepliesButton label={t("HIDE_REPLIES")} onPress={onHide} />
            )}
        </View>
    );
}

function ViewRepliesButton({ label, onPress }: { label: string; onPress: () => void }) {
    const { colors } = useTheme();

    return (
        <Pressable accessibilityRole="button" onPress={onPress} hitSlop={6} style={{ flexDirection: "row", alignItems: "center", gap: spacing[2], marginTop: spacing[2] }}>
            <View style={{ width: 24, height: 1, borderRadius: radius.full, backgroundColor: colors.default300 }} />
            <Text variant="tiny" weight={600} color="default500">
                {label}
            </Text>
        </Pressable>
    );
}
