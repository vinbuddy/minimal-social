import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { ReelFeed } from "@/components/reel/reel-feed";
import { ReelsTopBar } from "@/components/reel/reels-top-bar";
import { Text } from "@/components/ui";
import { useLightStatusBar } from "@/hooks/use-light-status-bar";
import { useReelFeed } from "@/hooks/use-reel-feed";
import { spacing } from "@/theme";

export default function ReelsScreen() {
    const { t } = useTranslation("reel");
    const { reels, isLoading, loadMore } = useReelFeed();
    useLightStatusBar();

    return (
        <ReelFeed
            reels={reels}
            isLoading={isLoading}
            onEndReached={loadMore}
            overlay={<ReelsTopBar />}
            empty={
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing[6] }}>
                    <Text style={{ color: "#ffffff", textAlign: "center" }}>{t("REEL_FEED_EMPTY")}</Text>
                </View>
            }
        />
    );
}
