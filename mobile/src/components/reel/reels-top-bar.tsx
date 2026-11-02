import { router } from "expo-router";
import { ChevronLeft, Plus, Volume2, VolumeX } from "lucide-react-native";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui";
import { goBack } from "@/lib/navigation";
import { useReelStore } from "@/stores/reel-store";
import { radius, spacing } from "@/theme";

const WHITE = "#ffffff";

/** Over the reels: back (or the "Reels" title on the tab), then sound and create */
export function ReelsTopBar({ showBack = false }: { showBack?: boolean }) {
    const { t } = useTranslation("reel");
    const insets = useSafeAreaInsets();
    const isMuted = useReelStore((state) => state.isMuted);
    const setMuted = useReelStore((state) => state.setMuted);

    return (
        <View
            pointerEvents="box-none"
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                paddingTop: insets.top,
                paddingHorizontal: spacing[2],
                flexDirection: "row",
                alignItems: "center",
                minHeight: 52,
            }}
        >
            {showBack ? (
                <IconButton label="Back" onPress={goBack}>
                    <ChevronLeft size={26} color={WHITE} />
                </IconButton>
            ) : (
                <Text
                    variant="heading"
                    accessibilityRole="header"
                    style={{ color: WHITE, paddingHorizontal: spacing[2], textShadowColor: "rgba(0, 0, 0, 0.5)", textShadowRadius: 4 }}
                >
                    {t("REELS")}
                </Text>
            )}
            <View style={{ flex: 1 }} />
            <IconButton label={t(isMuted ? "REEL_UNMUTE" : "REEL_MUTE")} onPress={() => setMuted(!isMuted)}>
                {isMuted ? <VolumeX size={22} color={WHITE} /> : <Volume2 size={22} color={WHITE} />}
            </IconButton>
            <IconButton label={t("REEL_CREATE")} onPress={() => router.push("/reels/create")}>
                <Plus size={26} color={WHITE} />
            </IconButton>
        </View>
    );
}

function IconButton({ label, onPress, children }: { label: string; onPress: () => void; children: ReactNode }) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={label}
            hitSlop={6}
            onPress={onPress}
            style={({ pressed }) => ({
                width: 44,
                height: 44,
                borderRadius: radius.full,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.6 : 1,
            })}
        >
            {children}
        </Pressable>
    );
}
