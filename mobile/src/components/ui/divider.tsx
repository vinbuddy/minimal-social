import { StyleProp, View, ViewStyle } from "react-native";

import { borderWidth, useTheme } from "@/theme";

/** The hairline that separates feed rows, list items and sections: lines, not cards */
export function Divider({ orientation = "horizontal", style }: { orientation?: "horizontal" | "vertical"; style?: StyleProp<ViewStyle> }) {
    const { colors } = useTheme();
    const isHorizontal = orientation === "horizontal";

    return (
        <View
            accessibilityRole="none"
            style={[
                {
                    backgroundColor: colors.divider,
                    height: isHorizontal ? borderWidth.divider : "100%",
                    width: isHorizontal ? "100%" : borderWidth.divider,
                },
                style,
            ]}
        />
    );
}
