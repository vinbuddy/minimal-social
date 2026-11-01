import { isAxiosError } from "axios";
import { router } from "expo-router";
import { Ban, ChevronLeft, MoreHorizontal, Settings, Share2 } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Share, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useSWR from "swr";

import { PostList } from "@/components/post/post-list";
import { ActionSheet, ActionSheetOption, Avatar, Button, Divider, Skeleton, Text, toast, UserName } from "@/components/ui";
import { ENV } from "@/config/env";
import { confirm } from "@/lib/confirm";
import { fetcher } from "@/lib/http";
import { invalidate } from "@/lib/invalidate";
import { goBack } from "@/lib/navigation";
import { getErrorMessage } from "@/services/auth";
import { blockUser, unblockUser, userUrl } from "@/services/users";
import useAuthStore from "@/stores/auth-store";
import { useFollowStore } from "@/stores/follow-store";
import { borderWidth, spacing, useTheme } from "@/theme";
import { IUser } from "@/types/user";
import { FollowButton } from "./follow-button";

type ProfileTab = "post" | "repost" | "liked";

/** The web's profile tabs; Liked is only the viewer's own (the API always returns the viewer's likes) */
const TAB_LABELS: Record<ProfileTab, string> = { post: "post:POST_FEED", repost: "post:POST_REPOSTED", liked: "post:POST_LIKED" };

function tabUrl(tab: ProfileTab, userId: string) {
    return tab === "liked" ? "/post/liked" : `/post/user-post?userId=${userId}&type=${tab}`;
}

/** A profile, Threads-style: name and avatar side by side, bio, counts, actions, then the user's posts */
export function ProfileView({ userId, isOwnTab = false }: { userId: string; isOwnTab?: boolean }) {
    const { t } = useTranslation(["user", "post", "app", "common"]);
    const { colors } = useTheme();
    const currentUser = useAuthStore((state) => state.currentUser);
    const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
    const setFollowing = useFollowStore((state) => state.setFollowing);
    const [tab, setTab] = useState<ProfileTab>("post");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [followerDelta, setFollowerDelta] = useState(0);

    const { data, error, isLoading } = useSWR<{ data: IUser | null }>(userUrl(userId), fetcher, {
        // Fresh counts replace the optimistic ones
        onSuccess: () => setFollowerDelta(0),
    });
    const user = data?.data;
    const isOwner = currentUser?._id === userId;
    const isBlockedByMe = !!currentUser?.blockedUsers?.some((blocked) => blocked._id === userId);
    const isBlockingMe = isAxiosError(error) && error.response?.status === 403;

    const shareProfile = () => {
        if (ENV.WEB_URL) Share.share({ message: `${ENV.WEB_URL}/profile/${userId}` });
    };

    const toggleBlock = async () => {
        if (!user || !currentUser) return;
        const action = isBlockedByMe ? t("USER.UNBLOCK") : t("USER.BLOCK");
        const isConfirmed = await confirm({
            title: t("USER.BLOCK_UNBLOCK_ACTION", { action, username: user.username }),
            message: isBlockedByMe ? undefined : t("USER.BLOCK.NOTE_2", { username: user.username }),
            confirmLabel: isBlockedByMe ? t("USER.UNBLOCK_USER") : t("USER.BLOCK_USER"),
            cancelLabel: t("common:CANCEL"),
            destructive: !isBlockedByMe,
        });
        if (!isConfirmed) return;

        try {
            if (isBlockedByMe) {
                await unblockUser(userId);
                setCurrentUser({ ...currentUser, blockedUsers: currentUser.blockedUsers.filter((blocked) => blocked._id !== userId) });
            } else {
                await blockUser(userId);
                // Blocking removes follows both ways
                setFollowing(userId, false);
                setCurrentUser({ ...currentUser, blockedUsers: [...(currentUser.blockedUsers ?? []), user] });
            }
            invalidate("/user");
            invalidate("/post");
            invalidate("/account/blocked");
        } catch (blockError) {
            toast.error(getErrorMessage(blockError));
        }
    };

    const menuOptions: ActionSheetOption[] = [
        ...(ENV.WEB_URL ? [{ label: t("USER.SHARE_PROFILE"), icon: Share2, onPress: shareProfile }] : []),
        ...(!isOwner && user ? [{ label: t(isBlockedByMe ? "USER.UNBLOCK_USER" : "USER.BLOCK_USER"), icon: Ban, destructive: !isBlockedByMe, onPress: toggleBlock }] : []),
    ];

    const tabs: ProfileTab[] = isOwner ? ["post", "repost", "liked"] : ["post", "repost"];

    const topBar = (
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing[2], minHeight: 48 }}>
            {isOwnTab ? (
                <View style={{ width: 40 }} />
            ) : (
                <Button isIconOnly variant="light" color="default" radius="full" accessibilityLabel={t("app:BACK")} onPress={goBack}>
                    <ChevronLeft size={24} color={colors.foreground} />
                </Button>
            )}
            <View style={{ flex: 1 }} />
            {isOwnTab ? (
                <Button isIconOnly variant="light" color="default" radius="full" accessibilityLabel={t("USER.SETTING")} onPress={() => router.push("/settings")}>
                    <Settings size={22} color={colors.foreground} />
                </Button>
            ) : menuOptions.length > 0 ? (
                <Button isIconOnly variant="light" color="default" radius="full" accessibilityLabel="More" onPress={() => setIsMenuOpen(true)}>
                    <MoreHorizontal size={22} color={colors.foreground} />
                </Button>
            ) : null}
        </View>
    );

    if (isLoading) {
        return (
            <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
                {topBar}
                <View style={{ flexDirection: "row", padding: spacing[4], gap: spacing[4] }}>
                    <View style={{ flex: 1, gap: spacing[2] }}>
                        <Skeleton width="50%" height={24} />
                        <Skeleton width="80%" height={14} />
                        <Skeleton width="40%" height={14} />
                    </View>
                    <Skeleton width={80} height={80} radius="full" />
                </View>
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
                {topBar}
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing[6] }}>
                    <Text color="default500" style={{ textAlign: "center" }}>
                        {isBlockingMe ? t("app:PROFILE_UNAVAILABLE") : error ? getErrorMessage(error) : t("app:PROFILE_UNAVAILABLE")}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    const followerCount = Math.max(0, (user.followerCount ?? 0) + followerDelta);
    const openFollows = (type: "follower" | "following") => router.push({ pathname: "/profile/[id]/follows", params: { id: userId, type } });

    const header = (
        <View>
            <View style={{ paddingHorizontal: spacing[4], paddingTop: spacing[2], gap: spacing[3] }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[4] }}>
                    <View style={{ flex: 1, gap: spacing[1] }}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <UserName username={user.username} isVerified={user.isVerified} style={{ fontSize: 24, lineHeight: 30 }} />
                        </View>
                        {isOwner ? (
                            <Text variant="small" color="default500" numberOfLines={1}>
                                {user.email}
                            </Text>
                        ) : null}
                    </View>
                    <Avatar size="xl" src={user.photo} name={user.username} />
                </View>

                {user.bio && !isBlockedByMe ? <Text>{user.bio}</Text> : null}

                {!isBlockedByMe ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[1] }}>
                        <Pressable accessibilityRole="button" hitSlop={6} onPress={() => openFollows("follower")}>
                            <Text variant="small" color="default500">
                                <Text variant="small" weight={600}>
                                    {followerCount}
                                </Text>{" "}
                                {t("USER.FOLLOWER")}
                            </Text>
                        </Pressable>
                        <Text variant="small" color="default400">
                            ·
                        </Text>
                        <Pressable accessibilityRole="button" hitSlop={6} onPress={() => openFollows("following")}>
                            <Text variant="small" color="default500">
                                <Text variant="small" weight={600}>
                                    {user.followingCount ?? 0}
                                </Text>{" "}
                                {t("USER.FOLLOWING")}
                            </Text>
                        </Pressable>
                    </View>
                ) : null}

                <View style={{ flexDirection: "row", gap: spacing[2], paddingBottom: spacing[4] }}>
                    {isOwner ? (
                        <>
                            <Button variant="bordered" color="default" size="sm" style={{ flex: 1 }} onPress={() => router.push("/edit-profile")}>
                                {t("USER.EDIT_PROFILE")}
                            </Button>
                            {ENV.WEB_URL ? (
                                <Button variant="bordered" color="default" size="sm" style={{ flex: 1 }} onPress={shareProfile}>
                                    {t("USER.SHARE_PROFILE")}
                                </Button>
                            ) : null}
                        </>
                    ) : isBlockedByMe ? (
                        <Button variant="bordered" color="default" size="sm" style={{ flex: 1 }} onPress={toggleBlock}>
                            {t("USER.UNBLOCK_USER")}
                        </Button>
                    ) : (
                        <>
                            <FollowButton user={user} size="sm" style={{ flex: 1 }} onChange={(delta) => setFollowerDelta((value) => value + delta)} />
                            {/* Conversations land in Phase 6 */}
                            <Button variant="bordered" color="default" size="sm" style={{ flex: 1 }} isDisabled>
                                {t("USER.SEND_MESSAGE")}
                            </Button>
                        </>
                    )}
                </View>
            </View>

            {isBlockedByMe ? (
                <View>
                    <Divider />
                    <Text color="default500" style={{ textAlign: "center", padding: spacing[12] }}>
                        {t("app:BLOCKED_NOTICE")}
                    </Text>
                </View>
            ) : (
                <View accessibilityRole="tablist" style={{ flexDirection: "row", borderBottomWidth: borderWidth.divider, borderBottomColor: colors.divider }}>
                    {tabs.map((item) => {
                        const isActive = item === tab;
                        return (
                            <Pressable
                                key={item}
                                accessibilityRole="tab"
                                accessibilityState={{ selected: isActive }}
                                onPress={() => setTab(item)}
                                style={{
                                    flex: 1,
                                    alignItems: "center",
                                    paddingVertical: spacing[3],
                                    borderBottomWidth: borderWidth.medium,
                                    borderBottomColor: isActive ? colors.foreground : "transparent",
                                    marginBottom: -borderWidth.divider,
                                }}
                            >
                                <Text variant="small" weight={600} color={isActive ? "foreground" : "default500"}>
                                    {t(TAB_LABELS[item])}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
            {topBar}
            {isBlockedByMe ? header : <PostList key={tab} url={tabUrl(tab, userId)} header={header} />}
            <ActionSheet isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} options={menuOptions} />
        </SafeAreaView>
    );
}
