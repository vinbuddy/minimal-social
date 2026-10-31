import { useEffect } from "react";
import { Animated, DimensionValue, StyleProp, View, ViewStyle } from "react-native";

import { useAnimatedValue } from "@/hooks/use-animated-value";
import { radius as radii, useTheme } from "@/theme";

export type SkeletonProps = {
    width?: DimensionValue;
    height?: DimensionValue;
    radius?: keyof typeof radii;
    style?: StyleProp<ViewStyle>;
};

/** `content3` block with a `content4` shimmer, the only looping motion besides loaders */
export function Skeleton({ width = "100%", height = 16, radius = "small", style }: SkeletonProps) {
    const { colors } = useTheme();
    const shimmer = useAnimatedValue(0);

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmer, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(shimmer, { toValue: 0, duration: 800, useNativeDriver: true }),
            ])
        );
        loop.start();

        return () => loop.stop();
    }, [shimmer]);

    return (
        <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[{ width, height, borderRadius: radii[radius], overflow: "hidden", backgroundColor: colors.content3 }, style]}
        >
            <Animated.View style={{ flex: 1, backgroundColor: colors.content4, opacity: shimmer }} />
        </View>
    );
}
