import { router } from "expo-router";
import { Eye, MoreHorizontal, Pencil, Share2, Trash2 } from "lucide-react-native";
import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Share, View } from "react-native";

import { RepostIcon } from "@/components/icons";
import { RichText } from "@/components/rich-text";
import { ActionSheet, ActionSheetOption, Avatar, Text, toast, UserName } from "@/components/ui";
import { ENV } from "@/config/env";
import { confirm } from "@/lib/confirm";
import { formatRelativeTime, formatShortTime } from "@/lib/time";
import { invalidate } from "@/lib/invalidate";
import { getErrorMessage } from "@/services/auth";
import { deletePost } from "@/services/posts";
import useAuthStore from "@/stores/auth-store";
import { spacing, useTheme } from "@/theme";
import { IPost } from "@/types/post";
import { MediaCarousel } from "./media-carousel";
import { PostActions } from "./post-actions";

/** The md avatar in the gutter */
const AVATAR_SIZE = 40;

type PostItemProps = {
    post: IPost;
    /** `detail` is the post's own screen: full timestamp, no tap-through */
    variant?: "feed" | "detail";
    onDeleted?: () => void;
};

/** A feed row: avatar gutter, name and time, caption, media, actions; hairline-separated by the list, no card */
export const PostItem = memo(function PostItem({ post: wrapper, variant = "feed", onDeleted }: PostItemProps) {
    const { t, i18n } = useTranslation(["post", "common", "app"]);
    const { colors } = useTheme();
    const currentUser = useAuthStore((state) => state.currentUser);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // A repost shows the original post under a "X reposted" line
    const isRepost = !!wrapper.originalPost;
    const post = wrapper.originalPost ?? wrapper;
    const isOwner = post.postBy._id === currentUser?._id;
    const canDelete = isOwner || !!currentUser?.isAdmin;
    const openDetail = () => router.push({ pathname: "/post/[id]", params: { id: post._id } });
    const openProfile = (userId: string) => router.push({ pathname: "/profile/[id]", params: { id: userId } });

    const handleDelete = async () => {
        const isConfirmed = await confirm({
            title: t("POST_MENU.DELETE"),
            confirmLabel: t("common:DELETE"),
            cancelLabel: t("common:CANCEL"),
            destructive: true,
        });
        if (!isConfirmed) return;

        try {
            await deletePost(post._id);
            toast.success(t("POST_DELETED_SUCCESS"));
            invalidate("/post");
            onDeleted?.();
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    const menuOptions: ActionSheetOption[] = [
        ...(variant === "feed" ? [{ label: t("POST_MENU.VIEW_POST"), icon: Eye, onPress: openDetail }] : []),
        // Shares the web link, as the web's "Copy link" does; needs EXPO_PUBLIC_WEB_URL
        ...(ENV.WEB_URL ? [{ label: t("POST_MENU.COPY_LINK"), icon: Share2, onPress: () => Share.share({ message: `${ENV.WEB_URL}/post/${post._id}` }) }] : []),
        ...(isOwner ? [{ label: t("POST_MENU.EDIT"), icon: Pencil, onPress: () => router.push({ pathname: "/compose", params: { postId: post._id } }) }] : []),
        ...(canDelete ? [{ label: t("POST_MENU.DELETE"), icon: Trash2, destructive: true, onPress: handleDelete }] : []),
    ];

    return (
        <Pressable onPress={variant === "feed" ? openDetail : undefined} disabled={variant === "detail"} style={{ paddingVertical: spacing[5], paddingHorizontal: spacing[4] }}>
            {isRepost ? (
                <Pressable
                    onPress={() => openProfile(wrapper.postBy._id)}
                    style={{ flexDirection: "row", alignItems: "center", gap: spacing[2], marginBottom: spacing[3], marginStart: spacing[5] }}
                >
                    <RepostIcon size={14} color={colors.default500} />
                    <Text variant="small" color="default500" numberOfLines={1} style={{ flexShrink: 1 }}>
                        <Text variant="small" weight={600} color="default600">
                            {wrapper.postBy.username}
                        </Text>{" "}
                        {t("POST_IS_REPOSTED")} · {formatShortTime(wrapper.createdAt, i18n.language)}
                    </Text>
                </Pressable>
            ) : null}

            <View style={{ flexDirection: "row" }}>
                <Pressable onPress={() => openProfile(post.postBy._id)} accessibilityRole="link" accessibilityLabel={post.postBy.username}>
                    <Avatar src={post.postBy.photo} name={post.postBy.username} />
                </Pressable>

                <View style={{ flex: 1, marginStart: spacing[4], gap: spacing[2] }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[2], minHeight: 24 }}>
                        <Pressable onPress={() => openProfile(post.postBy._id)} style={{ flexShrink: 1 }}>
                            <UserName username={post.postBy.username} isVerified={post.postBy.isVerified} />
                        </Pressable>
                        <Text variant="small" color="default500">
                            {variant === "detail" ? formatRelativeTime(post.createdAt, i18n.language) : formatShortTime(post.createdAt, i18n.language)}
                        </Text>
                        {post.isEdited ? <Pencil size={12} color={colors.default400} accessibilityLabel={t("POST_IS_EDITED")} /> : null}
                        <View style={{ flex: 1 }} />
                        {menuOptions.length > 0 ? (
                            <Pressable accessibilityRole="button" accessibilityLabel="More" hitSlop={10} onPress={() => setIsMenuOpen(true)}>
                                <MoreHorizontal size={18} color={colors.default500} />
                            </Pressable>
                        ) : null}
                    </View>

                    {post.caption ? <RichText html={post.caption} /> : null}
                    {post.mediaFiles.length > 0 ? (
                        <View style={{ marginTop: post.caption ? spacing[1] : 0 }}>
                            {/* The strip scrolls out to the screen edges: past the avatar gutter on the left, the row padding on the right */}
                            <MediaCarousel post={post} bleed={{ start: spacing[4] + AVATAR_SIZE + spacing[4], end: spacing[4] }} />
                        </View>
                    ) : null}
                    {post.moderationStatus === "pending" && isOwner ? (
                        <Text variant="tiny" color="default500">
                            {t("app:POST_PENDING_REVIEW")}
                        </Text>
                    ) : null}

                    <PostActions post={post} />
                </View>
            </View>

            <ActionSheet isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} options={menuOptions} />
        </Pressable>
    );
});
