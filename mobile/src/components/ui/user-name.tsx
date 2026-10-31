import { View } from "react-native";

import { VerifiedIcon } from "@/components/icons";
import { spacing } from "@/theme";
import { Text, TextProps } from "./text";

export type UserNameProps = Omit<TextProps, "variant" | "children"> & {
    username?: string | null;
    isVerified?: boolean;
};

/** Every username in the app goes through here: semibold, with the verified badge 6px after it */
export function UserName({ username, isVerified = false, style, ...props }: UserNameProps) {
    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[1.5], flexShrink: 1 }}>
            <Text variant="username" numberOfLines={1} style={[{ flexShrink: 1 }, style]} {...props}>
                {username || "Someone"}
            </Text>
            {isVerified ? <VerifiedIcon size={14} accessibilityLabel="Verified" /> : null}
        </View>
    );
}
