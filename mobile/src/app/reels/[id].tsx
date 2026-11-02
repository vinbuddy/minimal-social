import { isAxiosError } from "axios";
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useSWR from "swr";

import { ReelFeed } from "@/components/reel/reel-feed";
import { ReelsTopBar } from "@/components/reel/reels-top-bar";
import { Text } from "@/components/ui";
import { useLightStatusBar } from "@/hooks/use-light-status-bar";
import { useReelFeed } from "@/hooks/use-reel-feed";
import { fetcher } from "@/lib/http";
import { radius, spacing } from "@/theme";
import { IReel } from "@/types/reel";

/**
 * A reel opened by link (a grid, a notification, a shared URL): it plays first, then the feed continues below it,
 * as on the web. `?commentId=&rootComment=` opens its comments on that thread.
 */
export default function ReelScreen() {
    const { id, commentId, rootComment } = useLocalSearchParams<{ id: string; commentId?: string; rootComment?: string }>();
    const { data, error, isLoading } = useSWR<{ data: IReel }>(`/reel/${id}`, fetcher, { revalidateOnFocus: false });
    useLightStatusBar();

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: "#000000", justifyContent: "center" }}>
                <ActivityIndicator color="#ffffff" />
                <ReelsTopBar showBack />
            </View>
        );
    }

    return <Feed first={data?.data ?? null} isMissing={isAxiosError(error)} focusCommentId={rootComment ?? commentId} />;
}

function Feed({ first, isMissing, focusCommentId }: { first: IReel | null; isMissing: boolean; focusCommentId?: string }) {
    const { t } = useTranslation("reel");
    const insets = useSafeAreaInsets();
    const { reels, isLoading, loadMore } = useReelFeed(first);

    return (
        <ReelFeed
            reels={reels}
            isLoading={isLoading}
            onEndReached={loadMore}
            focusCommentId={first ? focusCommentId : undefined}
            overlay={
                <>
                    <ReelsTopBar showBack />
                    {/* Deleted or hidden: say so over the feed instead of a dead end, like the web */}
                    {isMissing ? (
                        <View
                            pointerEvents="none"
                            style={{
                                position: "absolute",
                                top: insets.top + 60,
                                alignSelf: "center",
                                paddingHorizontal: spacing[3],
                                paddingVertical: spacing[2],
                                borderRadius: radius.full,
                                backgroundColor: "rgba(0, 0, 0, 0.6)",
                            }}
                        >
                            <Text variant="small" weight={600} style={{ color: "#ffffff" }}>
                                {t("REEL_NOT_FOUND")}
                            </Text>
                        </View>
                    ) : null}
                </>
            }
        />
    );
}
