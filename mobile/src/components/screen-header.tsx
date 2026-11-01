import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { ReactNode } from "react";
import { View } from "react-native";

import { Button, Divider, Text } from "@/components/ui";
import { spacing, useTheme } from "@/theme";

/** Back button, centred title, optional right action, over a hairline */
export function ScreenHeader({ title, right, onBack }: { title: string; right?: ReactNode; onBack?: () => void }) {
    const { colors } = useTheme();

    return (
        <View>
            <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing[2], paddingVertical: spacing[1], minHeight: 48 }}>
                <View style={{ width: 80, alignItems: "flex-start" }}>
                    <Button isIconOnly variant="light" color="default" radius="full" accessibilityLabel="Back" onPress={onBack ?? (() => router.back())}>
                        <ChevronLeft size={24} color={colors.foreground} />
                    </Button>
                </View>
                <Text variant="large" weight={600} numberOfLines={1} style={{ flex: 1, textAlign: "center" }} accessibilityRole="header">
                    {title}
                </Text>
                <View style={{ width: 80, alignItems: "flex-end" }}>{right}</View>
            </View>
            <Divider />
        </View>
    );
}
