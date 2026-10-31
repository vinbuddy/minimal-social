import { ReactNode } from "react";
import { ScrollView, StyleProp, View, ViewStyle } from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/theme";

export type ScreenProps = {
    children: ReactNode;
    /** Wrap the content in a ScrollView */
    scroll?: boolean;
    edges?: Edge[];
    contentStyle?: StyleProp<ViewStyle>;
};

/** Page ground (`background`) with safe-area padding */
export function Screen({ children, scroll = false, edges = ["top", "bottom"], contentStyle }: ScreenProps) {
    const { colors } = useTheme();

    return (
        <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: colors.background }}>
            {scroll ? (
                <ScrollView contentContainerStyle={contentStyle} keyboardShouldPersistTaps="handled">
                    {children}
                </ScrollView>
            ) : (
                <View style={[{ flex: 1 }, contentStyle]}>{children}</View>
            )}
        </SafeAreaView>
    );
}
