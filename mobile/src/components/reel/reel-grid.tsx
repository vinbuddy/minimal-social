import { Image } from "expo-image";
import { router } from "expo-router";
import { Clock, Play } from "lucide-react-native";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Pressable, useWindowDimensions, View } from "react-native";

import { Text } from "@/components/ui";
import { usePagination } from "@/hooks/use-pagination";
import { formatCompactNumber } from "@/lib/format";
import { spacing, useTheme } from "@/theme";
import { IReel } from "@/types/reel";

const COLUMNS = 3;
const GAP = 2;
const MAX_WIDTH = 600;

type ReelGridProps = {
    /** A paginated reel list: /reel/user/:id, /reel/audio/:id/reels */
    url: string;
    header?: ReactElement;
    empty?: ReactElement;
};

/** The web's reel grid: 9:16 first frames in three columns with the view count; tapping one opens it */
export function ReelGrid({ url, header, empty }: ReelGridProps) {
    const { t } = useTranslation("reel");
    const { colors } = useTheme();
    const { width } = useWindowDimensions();
    const { items, isLoading, isLoadingMore, loadMore } = usePagination<IReel>(url);
    const tileWidth = (Math.min(width, MAX_WIDTH) - GAP * (COLUMNS - 1)) / COLUMNS;

    return (
        <FlatList
            data={items}
            numColumns={COLUMNS}
            keyExtractor={(reel) => reel._id}
            columnWrapperStyle={{ gap: GAP }}
            contentContainerStyle={{ gap: GAP, paddingBottom: spacing[6] }}
            ListHeaderComponent={header}
            renderItem={({ item }) => (
                <Pressable
                    accessibilityRole="imagebutton"
                    accessibilityLabel={`${item.reelBy.username}, ${t("REEL_VIEWS")} ${item.viewCount}`}
                    onPress={() => router.push({ pathname: "/reels/[id]", params: { id: item._id } })}
                    style={({ pressed }) => ({ width: tileWidth, aspectRatio: 9 / 16, backgroundColor: colors.content3, opacity: pressed ? 0.85 : 1 })}
                >
                    <Image source={{ uri: item.video.thumbnailUrl }} style={{ flex: 1 }} contentFit="cover" recyclingKey={item._id} transition={150} />
                    <View style={{ position: "absolute", left: spacing[2], bottom: spacing[2], flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Play size={14} color="#ffffff" />
                        <Text variant="tiny" weight={600} style={{ color: "#ffffff", textShadowColor: "rgba(0, 0, 0, 0.6)", textShadowRadius: 3 }}>
                            {formatCompactNumber(item.viewCount)}
                        </Text>
                    </View>
                    {item.moderationStatus === "pending" ? (
                        <View accessibilityLabel={t("REEL_PENDING")} style={{ position: "absolute", top: spacing[2], right: spacing[2] }}>
                            <Clock size={16} color="#ffffff" />
                        </View>
                    ) : null}
                </Pressable>
            )}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={isLoading ? <ActivityIndicator style={{ padding: spacing[6] }} color={colors.default500} /> : empty}
            ListFooterComponent={
                isLoadingMore && items.length > 0 ? <ActivityIndicator style={{ padding: spacing[4] }} color={colors.default500} /> : undefined
            }
        />
    );
}
