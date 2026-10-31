import { Text as RNText, TextProps as RNTextProps } from "react-native";

import { ColorTokens, fontFamily, FontWeight, typography, TypographyVariant, useTheme } from "@/theme";

export type TextProps = RNTextProps & {
    variant?: TypographyVariant;
    /** A colour token; defaults to `foreground` */
    color?: keyof ColorTokens;
    weight?: FontWeight;
};

export function Text({ variant = "body", color = "foreground", weight, style, ...props }: TextProps) {
    const { colors } = useTheme();
    const { fontSize, lineHeight, fontWeight } = typography[variant];

    return (
        <RNText
            style={[{ fontSize, lineHeight, fontFamily: fontFamily[weight ?? fontWeight], color: colors[color] }, style]}
            {...props}
        />
    );
}
