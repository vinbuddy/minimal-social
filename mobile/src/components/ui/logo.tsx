import { Image } from "expo-image";

import { radius, useTheme } from "@/theme";

const LOGOS = {
    // File names describe the theme, not the tile colour: the dark tile goes on light grounds
    light: require("@/assets/images/logo-light.png"),
    dark: require("@/assets/images/logo-dark.png"),
};

/** The lowercase "m" mark; there is no wordmark */
export function Logo({ size = 40 }: { size?: number }) {
    const { theme } = useTheme();

    return (
        <Image
            source={LOGOS[theme]}
            accessibilityLabel="Minimal Social"
            style={{ width: size, height: size, borderRadius: radius.small }}
            contentFit="contain"
        />
    );
}
