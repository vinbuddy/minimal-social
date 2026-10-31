import { Image } from "expo-image";
import { useState } from "react";
import { StyleProp, View, ViewStyle } from "react-native";

import { borderWidth, radius, useTheme } from "@/theme";
import { Text } from "./text";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

/** HeroUI's sm/md/lg, plus xs for the tab bar and xl for the profile header */
const SIZES: Record<Size, number> = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80 };

export type AvatarProps = {
    src?: string | null;
    /** Used for the fallback initial and the accessibility label */
    name?: string;
    size?: Size;
    /** The `default` ring with a 2px gap, as HeroUI's `isBordered` */
    isBordered?: boolean;
    style?: StyleProp<ViewStyle>;
};

export function Avatar({ src, name, size = "md", isBordered = false, style }: AvatarProps) {
    const { colors } = useTheme();
    const [hasError, setHasError] = useState(false);
    const dimension = SIZES[size];
    const showImage = !!src && !hasError;

    const avatar = (
        <View
            accessibilityRole="image"
            accessibilityLabel={name}
            style={{
                width: dimension,
                height: dimension,
                borderRadius: radius.full,
                overflow: "hidden",
                backgroundColor: colors.default,
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {showImage ? (
                <Image
                    source={{ uri: src }}
                    style={{ width: dimension, height: dimension }}
                    contentFit="cover"
                    transition={150}
                    onError={() => setHasError(true)}
                />
            ) : (
                <Text variant={size === "xs" || size === "sm" ? "tiny" : "small"} weight={600} color="default600">
                    {name?.trim().charAt(0).toUpperCase() ?? ""}
                </Text>
            )}
        </View>
    );

    if (!isBordered) return <View style={style}>{avatar}</View>;

    return (
        <View
            style={[
                {
                    padding: 2,
                    borderRadius: radius.full,
                    borderWidth: borderWidth.medium,
                    borderColor: colors.default,
                    alignSelf: "flex-start",
                },
                style,
            ]}
        >
            {avatar}
        </View>
    );
}
