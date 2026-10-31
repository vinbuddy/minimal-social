import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, useFonts } from "@expo-google-fonts/inter";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider as NavigationThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ToastHost } from "@/components/ui";
import { restoreLanguage } from "@/i18n";
import { ThemeProvider, useTheme } from "@/theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [fontsLoaded, fontError] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });

    useEffect(() => {
        restoreLanguage();
    }, []);

    useEffect(() => {
        if (fontsLoaded || fontError) SplashScreen.hideAsync();
    }, [fontsLoaded, fontError]);

    // Without Inter the app still works on the system font, so a font error doesn't block rendering
    if (!fontsLoaded && !fontError) return null;

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
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
            <ToastHost />
        </NavigationThemeProvider>
    );
}
