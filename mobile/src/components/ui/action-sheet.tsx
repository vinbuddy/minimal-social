import { LucideIcon } from "lucide-react-native";
import { ReactNode } from "react";
import { Modal, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { radius, spacing, useTheme } from "@/theme";
import { Divider } from "./divider";
import { Text } from "./text";

export type ActionSheetOption = {
    label: string;
    icon?: LucideIcon;
    /** `danger` for destructive actions, as the web's menus colour Delete */
    destructive?: boolean;
    onPress: () => void;
};

type ActionSheetProps = {
    isOpen: boolean;
    onClose: () => void;
    options: ActionSheetOption[];
    title?: string;
    /** Above the options, e.g. a row of reactions */
    header?: ReactNode;
};

/** A bottom sheet of actions: the phone version of the web's dropdown menus (post menu, comment menu) */
export function ActionSheet({ isOpen, onClose, options, title, header }: ActionSheetProps) {
    const { colors, shadows } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable accessibilityLabel="Close" style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.4)" }} onPress={onClose} />
            <View
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    paddingBottom: insets.bottom + spacing[2],
                    paddingTop: spacing[2],
                    borderTopLeftRadius: radius.large,
                    borderTopRightRadius: radius.large,
                    backgroundColor: colors.content1,
                    boxShadow: shadows.large,
                }}
            >
                <View style={{ alignSelf: "center", width: 36, height: 4, borderRadius: radius.full, backgroundColor: colors.default300, marginBottom: spacing[2] }} />
                {title ? (
                    <Text variant="small" color="default500" style={{ textAlign: "center", paddingVertical: spacing[2] }}>
                        {title}
                    </Text>
                ) : null}
                {header}
                {options.map((option, index) => {
                    const Icon = option.icon;
                    const color = option.destructive ? colors.danger : colors.foreground;

                    return (
                        <View key={option.label}>
                            {index > 0 ? <Divider /> : null}
                            <Pressable
                                accessibilityRole="button"
                                onPress={() => {
                                    onClose();
                                    option.onPress();
                                }}
                                style={({ pressed }) => ({
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: spacing[3],
                                    paddingHorizontal: spacing[5],
                                    paddingVertical: spacing[4],
                                    backgroundColor: pressed ? colors.content2 : "transparent",
                                })}
                            >
                                {Icon ? <Icon size={20} color={color} /> : null}
                                <Text style={{ color }} weight={500}>
                                    {option.label}
                                </Text>
                            </Pressable>
                        </View>
                    );
                })}
            </View>
        </Modal>
    );
}
