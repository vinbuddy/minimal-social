import { Check, ChevronRight, LucideIcon } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Text } from "@/components/ui";
import { spacing, useTheme } from "@/theme";

type SettingsRowProps = {
    label: string;
    icon?: LucideIcon;
    /** Current value, shown greyed on the right ("Tiếng Việt") */
    value?: string;
    /** A choice in a list: shows a check instead of the chevron */
    isSelected?: boolean;
    destructive?: boolean;
    onPress: () => void;
};

/** A settings list row: icon, label, value, chevron (or check for choices); separated by the list's hairlines */
export function SettingsRow({ label, icon: Icon, value, isSelected, destructive = false, onPress }: SettingsRowProps) {
    const { colors } = useTheme();
    const ink = destructive ? colors.danger : colors.foreground;
    const isChoice = isSelected !== undefined;

    return (
        <Pressable
            accessibilityRole={isChoice ? "radio" : "button"}
            accessibilityState={isChoice ? { checked: isSelected } : undefined}
            onPress={onPress}
            style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: spacing[3],
                paddingHorizontal: spacing[4],
                paddingVertical: spacing[4],
                backgroundColor: pressed ? colors.content2 : "transparent",
            })}
        >
            {Icon ? <Icon size={20} color={ink} /> : null}
            <Text style={{ flex: 1, color: ink }} weight={isSelected ? 600 : 400}>
                {label}
            </Text>
            {value ? (
                <Text variant="small" color="default500">
                    {value}
                </Text>
            ) : null}
            {isChoice ? (
                <View style={{ width: 20 }}>{isSelected ? <Check size={20} color={colors.foreground} /> : null}</View>
            ) : destructive ? null : (
                <ChevronRight size={18} color={colors.default400} />
            )}
        </Pressable>
    );
}
