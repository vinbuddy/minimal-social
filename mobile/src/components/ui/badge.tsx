import { View } from "react-native";

import { radius, spacing, useTheme } from "@/theme";
import { Text } from "./text";

/** Unread count on `danger`: bold numerals only, capped at 99+ */
export function Badge({ count }: { count: number }) {
    const { colors } = useTheme();
    if (count <= 0) return null;

    return (
        <View
            style={{
                minWidth: 18,
                height: 18,
                paddingHorizontal: spacing[1],
                borderRadius: radius.full,
                backgroundColor: colors.danger,
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Text variant="tiny" weight={700} color="dangerForeground" style={{ fontSize: 11, lineHeight: 14 }}>
                {count > 99 ? "99+" : count}
            </Text>
        </View>
    );
}
