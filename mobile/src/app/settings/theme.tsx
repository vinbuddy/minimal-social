import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/screen-header";
import { SettingsRow } from "@/components/settings-row";
import { Divider } from "@/components/ui";
import { ThemePreference, useTheme } from "@/theme";

export default function ThemeScreen() {
    const { t } = useTranslation(["common", "app"]);
    const { colors, preference, setPreference } = useTheme();

    const options: { value: ThemePreference; label: string }[] = [
        { value: "system", label: t("app:THEME_SYSTEM") },
        { value: "light", label: t("THEME_LIGHT") },
        { value: "dark", label: t("THEME_DARK") },
    ];

    return (
        <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
            <ScreenHeader title={t("THEME")} />
            {options.map(({ value, label }, index) => (
                <View key={value}>
                    {index > 0 ? <Divider /> : null}
                    <SettingsRow label={label} isSelected={preference === value} onPress={() => setPreference(value)} />
                </View>
            ))}
        </SafeAreaView>
    );
}
