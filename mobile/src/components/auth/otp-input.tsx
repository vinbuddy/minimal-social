import { ComponentRef, useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import { Text } from "@/components/ui";
import { fontFamily, radius, spacing, useTheme } from "@/theme";

export const OTP_LENGTH = 6;

type OtpInputProps = {
    value: string;
    onChange: (value: string) => void;
    isInvalid?: boolean;
};

/**
 * Six boxes over one hidden TextInput, so paste and SMS/email autofill (`oneTimeCode`) fill every digit at once
 * instead of the web's one-input-per-digit focus juggling.
 */
export function OtpInput({ value, onChange, isInvalid = false }: OtpInputProps) {
    const { colors } = useTheme();
    const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
    const [isFocused, setIsFocused] = useState(false);

    return (
        <Pressable onPress={() => inputRef.current?.focus()} accessibilityRole="none">
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing[2] }}>
                {Array.from({ length: OTP_LENGTH }, (_, index) => {
                    const isActive = isFocused && index === Math.min(value.length, OTP_LENGTH - 1);

                    return (
                        <View
                            key={index}
                            style={{
                                flex: 1,
                                aspectRatio: 1,
                                maxWidth: 52,
                                borderRadius: radius.medium,
                                backgroundColor: colors.content2,
                                borderWidth: 2,
                                borderColor: isInvalid ? colors.danger : isActive ? colors.foreground : "transparent",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Text variant="title">{value[index] ?? ""}</Text>
                        </View>
                    );
                })}
            </View>
            <TextInput
                ref={inputRef}
                value={value}
                onChangeText={(text) => onChange(text.replace(/\D/g, "").slice(0, OTP_LENGTH))}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                maxLength={OTP_LENGTH}
                autoFocus
                caretHidden
                accessibilityLabel="OTP"
                // Kept in layout (not display: none) so it can take focus; drawn invisible over the boxes
                style={{ position: "absolute", inset: 0, opacity: 0, color: "transparent", fontFamily: fontFamily[400] }}
            />
        </Pressable>
    );
}
