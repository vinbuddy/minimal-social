import { ReactNode } from "react";
import { ActivityIndicator, Pressable, PressableProps, StyleProp, View, ViewStyle } from "react-native";

import { borderWidth, ColorTokens, motion, opacity, radius, spacing, useTheme } from "@/theme";
import { Text } from "./text";

type Variant = "solid" | "bordered" | "light" | "flat";
type Color = "primary" | "default" | "danger";
type Size = "sm" | "md" | "lg";

export type ButtonProps = Omit<PressableProps, "style" | "children"> & {
    children?: ReactNode;
    variant?: Variant;
    color?: Color;
    size?: Size;
    isLoading?: boolean;
    isDisabled?: boolean;
    /** Square (or round with `radius="full"`) button holding only an icon */
    isIconOnly?: boolean;
    fullWidth?: boolean;
    radius?: keyof typeof radius;
    startContent?: ReactNode;
    endContent?: ReactNode;
    style?: StyleProp<ViewStyle>;
};

/** HeroUI's button sizes, as on the web */
const SIZES = {
    sm: { height: 32, paddingHorizontal: spacing[3], textVariant: "tiny", radius: "small" },
    md: { height: 40, paddingHorizontal: spacing[4], textVariant: "small", radius: "medium" },
    lg: { height: 48, paddingHorizontal: spacing[6], textVariant: "body", radius: "large" },
} as const;

function getColors(colors: ColorTokens, variant: Variant, color: Color) {
    const fill = { primary: colors.primary, default: colors.default, danger: colors.danger }[color];
    const onFill = { primary: colors.primaryForeground, default: colors.foreground, danger: colors.dangerForeground }[color];
    // On the ground, ink-coloured text: `default` reads as foreground, the others as their own colour
    const ink = color === "default" ? colors.foreground : fill;

    switch (variant) {
        case "solid":
            return { background: fill, text: onFill, border: "transparent", pressedBackground: fill };
        case "bordered":
            return { background: "transparent", text: ink, border: fill, pressedBackground: colors.content2 };
        case "light":
            return { background: "transparent", text: ink, border: "transparent", pressedBackground: colors.default200 };
        case "flat":
            return { background: colors.content2, text: ink, border: "transparent", pressedBackground: colors.content3 };
    }
}

export function Button({
    children,
    variant = "solid",
    color = "primary",
    size = "md",
    isLoading = false,
    isDisabled = false,
    isIconOnly = false,
    fullWidth = false,
    radius: radiusName,
    startContent,
    endContent,
    style,
    ...props
}: ButtonProps) {
    const { colors } = useTheme();
    const sizeTokens = SIZES[size];
    const palette = getColors(colors, variant, color);
    const disabled = isDisabled || isLoading;

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled, busy: isLoading }}
            disabled={disabled}
            style={({ pressed }) => [
                {
                    height: sizeTokens.height,
                    minWidth: isIconOnly ? sizeTokens.height : undefined,
                    width: isIconOnly ? sizeTokens.height : undefined,
                    paddingHorizontal: isIconOnly ? 0 : sizeTokens.paddingHorizontal,
                    borderRadius: radius[radiusName ?? sizeTokens.radius],
                    borderWidth: variant === "bordered" ? borderWidth.medium : 0,
                    borderColor: palette.border,
                    backgroundColor: pressed ? palette.pressedBackground : palette.background,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: spacing[2],
                    alignSelf: fullWidth ? "stretch" : "flex-start",
                    opacity: disabled ? opacity.disabled : pressed && variant === "solid" ? opacity.pressed : 1,
                    transform: [{ scale: pressed ? motion.pressScale : 1 }],
                },
                style,
            ]}
            {...props}
        >
            {isLoading ? <ActivityIndicator size="small" color={palette.text} /> : startContent}
            {children == null ? null : typeof children === "string" ? (
                <Text variant={sizeTokens.textVariant} weight={500} style={{ color: palette.text }} numberOfLines={1}>
                    {children}
                </Text>
            ) : (
                <View>{children}</View>
            )}
            {endContent}
        </Pressable>
    );
}
