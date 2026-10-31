import { Eye, EyeOff } from "lucide-react-native";
import { ComponentRef, ReactNode, Ref, useState } from "react";
import { Pressable, StyleProp, TextInput, TextInputProps, View, ViewStyle } from "react-native";

import { fontFamily, radius, spacing, typography, useTheme } from "@/theme";
import { Text } from "./text";

export type InputProps = TextInputProps & {
    ref?: Ref<ComponentRef<typeof TextInput>>;
    label?: string;
    errorMessage?: string;
    /** Shows an eye toggle and hides the value */
    isPassword?: boolean;
    startContent?: ReactNode;
    endContent?: ReactNode;
    containerStyle?: StyleProp<ViewStyle>;
};

/** HeroUI's flat input: a filled `content2` field, label above, error below in `danger` */
export function Input({
    ref,
    label,
    errorMessage,
    isPassword = false,
    startContent,
    endContent,
    containerStyle,
    editable = true,
    onFocus,
    onBlur,
    style,
    ...props
}: InputProps) {
    const { colors } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [isRevealed, setIsRevealed] = useState(false);
    const isInvalid = !!errorMessage;

    return (
        <View style={[{ gap: spacing[1.5], opacity: editable ? 1 : 0.5 }, containerStyle]}>
            {label ? (
                <Text variant="small" weight={500} color={isInvalid ? "danger" : "foreground"}>
                    {label}
                </Text>
            ) : null}
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing[2],
                    minHeight: 40,
                    paddingHorizontal: spacing[3],
                    borderRadius: radius.medium,
                    backgroundColor: isFocused ? colors.default200 : colors.content2,
                    borderWidth: isInvalid ? 1 : 0,
                    borderColor: colors.danger,
                }}
            >
                {startContent}
                <TextInput
                    ref={ref}
                    editable={editable}
                    placeholderTextColor={colors.default500}
                    secureTextEntry={isPassword && !isRevealed}
                    autoCapitalize={isPassword ? "none" : props.autoCapitalize}
                    aria-invalid={isInvalid}
                    onFocus={(e) => {
                        setIsFocused(true);
                        onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        onBlur?.(e);
                    }}
                    style={[
                        {
                            flex: 1,
                            paddingVertical: spacing[2],
                            fontSize: typography.small.fontSize,
                            fontFamily: fontFamily[400],
                            color: colors.foreground,
                        },
                        style,
                    ]}
                    {...props}
                />
                {isPassword ? (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={isRevealed ? "Hide password" : "Show password"}
                        hitSlop={8}
                        onPress={() => setIsRevealed((value) => !value)}
                    >
                        {isRevealed ? <EyeOff size={16} color={colors.default500} /> : <Eye size={16} color={colors.default500} />}
                    </Pressable>
                ) : (
                    endContent
                )}
            </View>
            {errorMessage ? (
                <Text variant="tiny" color="danger">
                    {errorMessage}
                </Text>
            ) : null}
        </View>
    );
}
