import { router } from "expo-router";
import { Equal, Plus } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Pressable, useWindowDimensions, View } from "react-native";

import { ConversationIcon } from "@/components/icons";
import { PostList } from "@/components/post/post-list";
import { Avatar, Button, Divider, Logo, Screen, Text } from "@/components/ui";
import { FEED_URLS, FeedType } from "@/services/posts";
import useAuthStore from "@/stores/auth-store";
import { useFeedStore } from "@/stores/feed-store";
import { spacing, useTheme } from "@/theme";

const FEED_LABELS: Record<FeedType, string> = {
    feed: "POST_FEED",
    following: "POST_FOLLOWING",
    liked: "POST_LIKED",
};

export default function HomeScreen() {
    const { t } = useTranslation(["post", "app"]);
    const { colors } = useTheme();
    const feedType = useFeedStore((state) => state.feedType);
    const openDrawer = useFeedStore((state) => state.openDrawer);
    const { width: screenWidth } = useWindowDimensions();

    return (
        <Screen edges={["top"]}>
            {/* Threads' header: feeds menu on the left, the mark centred, actions on the right */}
            <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing[2], paddingVertical: spacing[1], minHeight: 52 }}>
                <Button isIconOnly variant="light" color="default" radius="full" accessibilityLabel={t("app:FEEDS")} onPress={openDrawer}>
                    <Equal size={26} color={colors.foreground} />
                </Button>
                {feedType !== "feed" ? (
                    // Stops short of the centred logo
                    <Text weight={600} numberOfLines={1} style={{ maxWidth: screenWidth / 2 - 48 - spacing[2] - 24 }}>
                        {t(FEED_LABELS[feedType])}
                    </Text>
                ) : null}
                <View style={{ flex: 1 }} />
                <Button isIconOnly variant="light" color="default" radius="full" accessibilityLabel={t("app:NEW_POST")} onPress={() => router.push("/compose")}>
                    <Plus size={26} color={colors.foreground} />
                </Button>
                {/* Conversations land in Phase 6 */}
                <Button isIconOnly variant="light" color="default" radius="full" accessibilityLabel="Direct" isDisabled>
                    <ConversationIcon size={24} />
                </Button>

                <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, alignItems: "center" }}>
                    <Logo size={32} />
                </View>
            </View>
            <Divider />

            {/* Keyed by feed so each keeps its own pages and scroll position */}
            <PostList key={feedType} url={FEED_URLS[feedType]} header={feedType === "feed" ? <ComposePrompt /> : undefined} />
        </Screen>
    );
}

/** "What's new?" row at the top of the feed, like Threads: the quickest way into the composer */
function ComposePrompt() {
    const { t } = useTranslation("app");
    const currentUser = useAuthStore((state) => state.currentUser);

    return (
        <View>
            <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/compose")}
                style={{ flexDirection: "row", alignItems: "center", gap: spacing[4], paddingHorizontal: spacing[4], paddingVertical: spacing[4] }}
            >
                <Avatar src={currentUser?.photo} name={currentUser?.username} />
                <Text color="default500">{t("COMPOSER_PLACEHOLDER")}</Text>
            </Pressable>
            <Divider />
        </View>
    );
}
