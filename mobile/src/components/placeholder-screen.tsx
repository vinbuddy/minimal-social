import { ReactNode } from "react";
import { View } from "react-native";

import { Screen, Text } from "@/components/ui";
import { spacing } from "@/theme";

/** A tab whose real screen lands in a later phase */
export function PlaceholderScreen({ title, phase, header }: { title: string; phase: string; header?: ReactNode }) {
    return (
        <Screen edges={["top"]}>
            {header}
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: spacing[2], padding: spacing[6] }}>
                <Text variant="heading">{title}</Text>
                <Text variant="small" color="default500" style={{ textAlign: "center" }}>
                    {phase}
                </Text>
            </View>
        </Screen>
    );
}
