import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, useFonts } from "@expo-google-fonts/inter";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider as NavigationThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Button, Logo, Text, ToastHost } from "@/components/ui";
import { restoreLanguage } from "@/i18n";
import useAuthStore from "@/stores/auth-store";
import { spacing, ThemeProvider, useTheme } from "@/theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [fontsLoaded, fontError] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
    const status = useAuthStore((state) => state.status);
    const bootstrap = useAuthStore((state) => state.bootstrap);

    useEffect(() => {
        restoreLanguage();
        bootstrap();
    }, [bootstrap]);

    // Without Inter the app still works on the system font, so a font error doesn't block rendering
    const isReady = (fontsLoaded || !!fontError) && status !== "loading";

    useEffect(() => {
        if (isReady) SplashScreen.hideAsync();
    }, [isReady]);

    // The splash screen stays up until we know whether to show sign-in or the feed
    if (!isReady) return null;

    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <ThemedNavigation />
            </ThemeProvider>
        </SafeAreaProvider>
    );
}

function ThemedNavigation() {
    const { theme, colors } = useTheme();
    const status = useAuthStore((state) => state.status);

    // React Navigation draws headers, tab bars and screen grounds from its own theme
    const navigationTheme = useMemo(() => {
        const base = theme === "dark" ? DarkTheme : DefaultTheme;

        return {
            ...base,
            colors: {
                ...base.colors,
                primary: colors.primary,
                background: colors.background,
                card: colors.background,
                text: colors.foreground,
                border: colors.divider,
                notification: colors.danger,
            },
        };
    }, [theme, colors]);

    return (
        <NavigationThemeProvider value={navigationTheme}>
            <StatusBar style={theme === "dark" ? "light" : "dark"} />
            {status === "offline" ? (
                <OfflineScreen />
            ) : (
                <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
                    <Stack.Protected guard={status === "authenticated"} redirectTo="/login">
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="kitchen-sink" />
                    </Stack.Protected>
                    <Stack.Protected guard={status !== "authenticated"} redirectTo="/">
                        <Stack.Screen name="login" />
                        <Stack.Screen name="register" />
                        <Stack.Screen name="otp" />
                        <Stack.Screen name="forgot" />
                        <Stack.Screen name="reset" />
                    </Stack.Protected>
                </Stack>
            )}
            <ToastHost />
        </NavigationThemeProvider>
    );
}

/** Tokens are stored but the server can't be reached to check them: don't sign the user out, let them retry */
function OfflineScreen() {
    const { t } = useTranslation("auth");
    const { colors } = useTheme();
    const bootstrap = useAuthStore((state) => state.bootstrap);
    const [isRetrying, setIsRetrying] = useState(false);

    const retry = async () => {
        setIsRetrying(true);
        await bootstrap();
        setIsRetrying(false);
    };

    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: spacing[4], padding: spacing[6], backgroundColor: colors.background }}>
            <Logo size={48} />
            <View style={{ gap: spacing[2], alignItems: "center" }}>
                <Text variant="heading">{t("OFFLINE_TITLE")}</Text>
                <Text variant="small" color="default500" style={{ textAlign: "center" }}>
                    {t("OFFLINE_SUBTITLE")}
                </Text>
            </View>
            <Button isLoading={isRetrying} onPress={retry}>
                {t("TRY_AGAIN")}
            </Button>
        </View>
    );
}
