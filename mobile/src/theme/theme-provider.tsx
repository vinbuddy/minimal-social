import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

import { getItem, setItem, STORAGE_KEYS } from "@/lib/storage";
import { colors, ColorTokens, shadows, ThemeName } from "./tokens";

export type ThemePreference = "system" | ThemeName;

type ThemeContextValue = {
    /** The theme actually rendered */
    theme: ThemeName;
    colors: ColorTokens;
    shadows: (typeof shadows)[ThemeName];
    preference: ThemePreference;
    setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const systemScheme = useColorScheme();
    const [preference, setPreferenceState] = useState<ThemePreference>("system");

    useEffect(() => {
        getItem(STORAGE_KEYS.theme).then((saved) => {
            if (saved === "light" || saved === "dark" || saved === "system") setPreferenceState(saved);
        });
    }, []);

    const value = useMemo<ThemeContextValue>(() => {
        const theme: ThemeName = preference === "system" ? (systemScheme === "dark" ? "dark" : "light") : preference;

        return {
            theme,
            colors: colors[theme],
            shadows: shadows[theme],
            preference,
            setPreference: (next) => {
                setPreferenceState(next);
                setItem(STORAGE_KEYS.theme, next);
            },
        };
    }, [preference, systemScheme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme must be used inside ThemeProvider");

    return context;
}
