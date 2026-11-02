import { useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useCallback } from "react";

import { useTheme } from "@/theme";

/** White status bar text over a black screen (reels), back to the theme's when leaving */
export function useLightStatusBar() {
    const { theme } = useTheme();

    useFocusEffect(
        useCallback(() => {
            setStatusBarStyle("light");
            return () => setStatusBarStyle(theme === "dark" ? "light" : "dark");
        }, [theme]),
    );
}
