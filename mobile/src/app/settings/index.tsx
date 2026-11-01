import { router } from "expo-router";
import { Ban, Languages, LogOut, Palette, SunMoon, UserRound } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/screen-header";
import { SettingsRow } from "@/components/settings-row";
import { Divider } from "@/components/ui";
import { confirm } from "@/lib/confirm";
import useAuthStore from "@/stores/auth-store";
import { spacing, useTheme } from "@/theme";

/** The web's settings (account, blocked users, language) plus theme and log out from its avatar menu */
export default function SettingsScreen() {
    const { t, i18n } = useTranslation(["user", "common", "app"]);
    const { colors, preference } = useTheme();
    const signOut = useAuthStore((state) => state.signOut);

    const themeLabel = { system: t("app:THEME_SYSTEM"), light: t("common:THEME_LIGHT"), dark: t("common:THEME_DARK") }[preference];

    const logOut = async () => {
        const isConfirmed = await confirm({ title: t("app:LOGOUT_CONFIRM"), confirmLabel: t("common:LOGOUT"), cancelLabel: t("common:CANCEL"), destructive: true });
        if (isConfirmed) await signOut();
    };

    return (
        <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
            <ScreenHeader title={t("USER.SETTING.TITLE")} />
            <ScrollView contentContainerStyle={{ paddingBottom: spacing[12] }}>
                <SettingsRow icon={UserRound} label={t("USER.SETTING.ACCOUNT")} onPress={() => router.push("/settings/account")} />
                <Divider />
                <SettingsRow icon={Ban} label={t("USER.SETTING.BLOCKED_USER")} onPress={() => router.push("/settings/blocked")} />
                <Divider />
                <SettingsRow
                    icon={Languages}
                    label={t("USER.SETTING.LANGUAGE")}
                    value={i18n.language === "vi" ? "Tiếng Việt" : "English"}
                    onPress={() => router.push("/settings/language")}
                />
                <Divider />
                <SettingsRow icon={SunMoon} label={t("common:THEME")} value={themeLabel} onPress={() => router.push("/settings/theme")} />
                <Divider />
                {__DEV__ ? (
                    <View>
                        <SettingsRow icon={Palette} label="Kitchen sink" onPress={() => router.push("/kitchen-sink")} />
                        <Divider />
                    </View>
                ) : null}
                <SettingsRow icon={LogOut} label={t("common:LOGOUT")} destructive onPress={logOut} />
            </ScrollView>
        </SafeAreaView>
    );
}
