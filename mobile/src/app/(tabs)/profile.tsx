import { router } from "expo-router";
import { LogOut, Palette } from "lucide-react-native";
import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Avatar, Button, Divider, Screen, Text, UserName } from "@/components/ui";
import { changeLanguage, Language } from "@/i18n";
import useAuthStore from "@/stores/auth-store";
import { spacing, ThemePreference, useTheme } from "@/theme";

/** The signed-in user and the web's avatar-menu actions (theme, language, log out). The full profile lands in Phase 4. */
export default function ProfileScreen() {
    const { t, i18n } = useTranslation();
    const { colors, preference, setPreference } = useTheme();
    const currentUser = useAuthStore((state) => state.currentUser);
    const signOut = useAuthStore((state) => state.signOut);
    const [isSigningOut, setIsSigningOut] = useState(false);

    const handleSignOut = async () => {
        setIsSigningOut(true);
        await signOut();
    };

    return (
        <Screen scroll edges={["top"]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[4], padding: spacing[4] }}>
                <Avatar size="lg" src={currentUser?.photo} name={currentUser?.username} isBordered />
                <View style={{ flex: 1, gap: spacing[1] }}>
                    <UserName username={currentUser?.username} isVerified={currentUser?.isVerified} />
                    <Text variant="small" color="default500" numberOfLines={1}>
                        {currentUser?.email}
                    </Text>
                </View>
            </View>
            {currentUser?.bio ? (
                <Text variant="small" color="default500" style={{ paddingHorizontal: spacing[4], paddingBottom: spacing[4] }}>
                    {currentUser.bio}
                </Text>
            ) : null}

            <Divider />
            <SettingRow label={t("THEME")}>
                {(["system", "light", "dark"] as ThemePreference[]).map((option) => (
                    <Button key={option} size="sm" variant={preference === option ? "solid" : "bordered"} onPress={() => setPreference(option)}>
                        {option === "system" ? "Auto" : t(option === "light" ? "THEME_LIGHT" : "THEME_DARK")}
                    </Button>
                ))}
            </SettingRow>
            <Divider />
            <SettingRow label="Language">
                {(["vi", "en"] as Language[]).map((language) => (
                    <Button key={language} size="sm" variant={i18n.language === language ? "solid" : "bordered"} onPress={() => changeLanguage(language)}>
                        {language === "vi" ? "Tiếng Việt" : "English"}
                    </Button>
                ))}
            </SettingRow>
            <Divider />

            <View style={{ padding: spacing[4], gap: spacing[3] }}>
                {__DEV__ ? (
                    <Button
                        fullWidth
                        variant="bordered"
                        color="default"
                        startContent={<Palette size={16} color={colors.foreground} />}
                        onPress={() => router.push("/kitchen-sink")}
                    >
                        Kitchen sink
                    </Button>
                ) : null}
                <Button
                    fullWidth
                    color="danger"
                    variant="flat"
                    isLoading={isSigningOut}
                    startContent={<LogOut size={16} color={colors.danger} />}
                    onPress={handleSignOut}
                >
                    {t("LOGOUT")}
                </Button>
            </View>
        </Screen>
    );
}

function SettingRow({ label, children }: { label: string; children: ReactNode }) {
    return (
        <View style={{ padding: spacing[4], gap: spacing[3] }}>
            <Text variant="small" weight={600}>
                {label}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[2] }}>{children}</View>
        </View>
    );
}
