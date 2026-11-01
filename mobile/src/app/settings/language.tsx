import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/screen-header";
import { SettingsRow } from "@/components/settings-row";
import { Divider } from "@/components/ui";
import { changeLanguage, Language } from "@/i18n";
import { useTheme } from "@/theme";

/** Same options as the web (client/src/constants/language.ts) */
const LANGUAGES: { code: Language; label: string }[] = [
    { code: "vi", label: "Tiếng Việt" },
    { code: "en", label: "English" },
];

export default function LanguageScreen() {
    const { t, i18n } = useTranslation("user");
    const { colors } = useTheme();

    return (
        <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
            <ScreenHeader title={t("USER.SETTING.LANGUAGE")} />
            {LANGUAGES.map(({ code, label }, index) => (
                <View key={code}>
                    {index > 0 ? <Divider /> : null}
                    <SettingsRow label={label} isSelected={i18n.language === code} onPress={() => changeLanguage(code)} />
                </View>
            ))}
        </SafeAreaView>
    );
}
