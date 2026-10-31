/**
 * Design tokens of the Minimal Social design system (tokens.json), as used by the web client.
 * Ink is the only accent: `primary` is near-black in light theme and white in dark.
 * Keep values in sync with the design system rather than inventing new ones here.
 */

export type ThemeName = "light" | "dark";

const light = {
    background: "#ffffff",
    foreground: "#000000",
    divider: "rgba(17, 17, 17, 0.15)",
    focus: "#006fee",
    overlay: "#000000",
    content1: "#ffffff",
    content2: "#f4f4f5",
    content2Foreground: "#27272a",
    content3: "#e4e4e7",
    content4: "#d4d4d8",
    primary: "#18181b",
    primaryForeground: "#ffffff",
    default: "#d4d4d8",
    default200: "#e4e4e7",
    default300: "#d4d4d8",
    /** Icons and timestamps only: 2.6:1 on white, fails as text */
    default400: "#a1a1aa",
    /** Secondary text: bios, captions */
    default500: "#71717a",
    default600: "#52525b",
    default700: "#3f3f46",
    danger: "#f31260",
    dangerForeground: "#ffffff",
    success: "#17c964",
    successForeground: "#000000",
    warning: "#f5a524",
    link: "#0095f6",
    like: "#ff3040",
    verify: "#0095f6",
    placeholder: "#999999",
};

export type ColorTokens = typeof light;

const dark: ColorTokens = {
    background: "#0a0a0a",
    foreground: "#fafafa",
    divider: "rgba(255, 255, 255, 0.15)",
    focus: "#006fee",
    overlay: "#000000",
    content1: "#18181b",
    content2: "#27272a",
    content2Foreground: "#f4f4f5",
    content3: "#3f3f46",
    content4: "#52525b",
    primary: "#ffffff",
    primaryForeground: "#000000",
    default: "#3f3f46",
    default200: "#3f3f46",
    default300: "#52525b",
    default400: "#71717a",
    default500: "#a1a1aa",
    default600: "#d4d4d8",
    default700: "#e4e4e7",
    danger: "#f31260",
    dangerForeground: "#ffffff",
    success: "#17c964",
    successForeground: "#000000",
    warning: "#f5a524",
    link: "#0095f6",
    like: "#ff3040",
    verify: "#0095f6",
    placeholder: "#999999",
};

export const colors: Record<ThemeName, ColorTokens> = { light, dark };

/** Tailwind's 4px scale, named as in the design system (`space-2` = 8px) */
export const spacing = {
    0.5: 2,
    1: 4,
    1.5: 6,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    12: 48,
} as const;

export const radius = {
    small: 8,
    medium: 12,
    large: 14,
    bubble: 18,
    full: 9999,
} as const;

export const borderWidth = {
    divider: 1,
    small: 1,
    medium: 2,
    large: 3,
} as const;

export const opacity = {
    disabled: 0.5,
    pressed: 0.8,
} as const;

/** Inter is loaded per weight, since custom fonts on Android ignore `fontWeight` */
export const fontFamily = {
    400: "Inter_400Regular",
    500: "Inter_500Medium",
    600: "Inter_600SemiBold",
    700: "Inter_700Bold",
} as const;

export type FontWeight = keyof typeof fontFamily;

type TextStyleToken = { fontSize: number; lineHeight: number; fontWeight: FontWeight };

export const typography = {
    /** Auth and OTP page titles */
    display: { fontSize: 30, lineHeight: 36, fontWeight: 700 },
    /** Page titles */
    title: { fontSize: 24, lineHeight: 32, fontWeight: 700 },
    /** Section headings in settings and modals */
    heading: { fontSize: 20, lineHeight: 28, fontWeight: 600 },
    large: { fontSize: 18, lineHeight: 28, fontWeight: 400 },
    /** Post captions and comments */
    body: { fontSize: 16, lineHeight: 24, fontWeight: 400 },
    /** Always set through UserName */
    username: { fontSize: 16, lineHeight: 20, fontWeight: 600 },
    /** Chat bubble text */
    message: { fontSize: 15, lineHeight: 22, fontWeight: 400 },
    /** Secondary lines: post time, last-message preview */
    small: { fontSize: 14, lineHeight: 20, fontWeight: 400 },
    /** Timestamps, chips, form errors */
    tiny: { fontSize: 12, lineHeight: 16, fontWeight: 400 },
    /** A single-emoji message renders bubble-less at this size */
    emoji: { fontSize: 24, lineHeight: 32, fontWeight: 400 },
} satisfies Record<string, TextStyleToken>;

export type TypographyVariant = keyof typeof typography;

/** Only floating layers (menus, sheets, modals) get shadows; content lists use dividers */
export const shadows: Record<ThemeName, Record<"small" | "medium" | "large", string>> = {
    light: {
        small: "0px 0px 5px 0px rgba(0, 0, 0, 0.02), 0px 2px 10px 0px rgba(0, 0, 0, 0.06), 0px 0px 1px 0px rgba(0, 0, 0, 0.3)",
        medium: "0px 0px 15px 0px rgba(0, 0, 0, 0.03), 0px 2px 30px 0px rgba(0, 0, 0, 0.08), 0px 0px 1px 0px rgba(0, 0, 0, 0.3)",
        large: "0px 0px 30px 0px rgba(0, 0, 0, 0.04), 0px 30px 60px 0px rgba(0, 0, 0, 0.12), 0px 0px 1px 0px rgba(0, 0, 0, 0.3)",
    },
    dark: {
        small: "0px 0px 5px 0px rgba(0, 0, 0, 0.05), 0px 2px 10px 0px rgba(0, 0, 0, 0.2), inset 0px 0px 1px 0px rgba(255, 255, 255, 0.15)",
        medium: "0px 0px 15px 0px rgba(0, 0, 0, 0.06), 0px 2px 30px 0px rgba(0, 0, 0, 0.22), inset 0px 0px 1px 0px rgba(255, 255, 255, 0.15)",
        large: "0px 0px 30px 0px rgba(0, 0, 0, 0.07), 0px 30px 60px 0px rgba(0, 0, 0, 0.26), inset 0px 0px 1px 0px rgba(255, 255, 255, 0.15)",
    },
};

/** Quick, functional motion: 150–200ms fades, 97% press scale */
export const motion = {
    fast: 150,
    normal: 200,
    pressScale: 0.97,
} as const;
