import { Check } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HeartIcon } from "@/components/icons";
import { Divider, Text } from "@/components/ui";
import { FeedType } from "@/services/posts";
import { useFeedStore } from "@/stores/feed-store";
import { borderWidth, radius, spacing, useTheme } from "@/theme";

const LIST_FEEDS: { type: FeedType; labelKey: string }[] = [
    { type: "feed", labelKey: "POST_FEED" },
    { type: "following", labelKey: "POST_FOLLOWING" },
];

/**
 * Threads' feed picker: a title, the Liked tile, then the feeds as one bordered group with hairlines.
 * Drawn under the tabs, which slide right to reveal it.
 */
export function FeedDrawer({ width }: { width: number }) {
    const { t } = useTranslation(["post", "app"]);
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const feedType = useFeedStore((state) => state.feedType);
    const selectFeed = useFeedStore((state) => state.selectFeed);
    const isLiked = feedType === "liked";

    return (
        <View style={{ width, paddingTop: insets.top + spacing[4], paddingHorizontal: spacing[4], gap: spacing[4] }}>
            <Text variant="title" accessibilityRole="header" style={{ paddingHorizontal: spacing[1] }}>
                {t("app:FEEDS")}
            </Text>

            <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isLiked }}
                onPress={() => selectFeed("liked")}
                style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: spacing[2],
                    height: 56,
                    borderRadius: radius.large,
                    borderWidth: borderWidth.divider,
                    borderColor: isLiked ? colors.foreground : colors.divider,
                    backgroundColor: pressed ? colors.content2 : colors.content1,
                })}
            >
                <HeartIcon size={22} filled={isLiked} />
                <Text weight={isLiked ? 600 : 500}>{t("POST_LIKED")}</Text>
            </Pressable>

            <View style={{ borderRadius: radius.large, borderWidth: borderWidth.divider, borderColor: colors.divider, backgroundColor: colors.content1, overflow: "hidden" }}>
                {LIST_FEEDS.map(({ type, labelKey }, index) => {
                    const isActive = feedType === type;
                    return (
                        <View key={type}>
                            {index > 0 ? <Divider style={{ marginStart: spacing[5], width: undefined }} /> : null}
                            <Pressable
                                accessibilityRole="button"
                                accessibilityState={{ selected: isActive }}
                                onPress={() => selectFeed(type)}
                                style={({ pressed }) => ({
                                    flexDirection: "row",
                                    alignItems: "center",
                                    paddingHorizontal: spacing[5],
                                    paddingVertical: spacing[5],
                                    backgroundColor: pressed ? colors.content2 : "transparent",
                                })}
                            >
                                <Text weight={isActive ? 600 : 400} style={{ flex: 1 }}>
                                    {t(labelKey)}
                                </Text>
                                {isActive ? <Check size={20} color={colors.foreground} /> : null}
                            </Pressable>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}
