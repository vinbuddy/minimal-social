import { CircleAlert, CircleCheck, Info } from "lucide-react-native";
import { useEffect, useSyncExternalStore } from "react";
import { Animated, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAnimatedValue } from "@/hooks/use-animated-value";
import { motion, radius, spacing, useTheme } from "@/theme";
import { Text } from "./text";

type ToastType = "info" | "success" | "error";
type ToastItem = { id: number; message: string; type: ToastType };

const DURATION = 3000;
const MAX_VISIBLE = 3;

let toasts: ToastItem[] = [];
let nextId = 0;
const listeners = new Set<() => void>();

function emit() {
    listeners.forEach((listener) => listener());
}

function show(message: string, type: ToastType) {
    const id = nextId++;
    toasts = [...toasts, { id, message, type }].slice(-MAX_VISIBLE);
    emit();

    setTimeout(() => {
        toasts = toasts.filter((item) => item.id !== id);
        emit();
    }, DURATION);
}

/**
 * Outcome in a few words, no exclamation marks ("Liked post successfully", "Failed to repost").
 * Shown bottom centre, like sonner on the web.
 */
export const toast = Object.assign((message: string) => show(message, "info"), {
    success: (message: string) => show(message, "success"),
    error: (message: string) => show(message, "error"),
});

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

/** Render once, at the root of the app */
export function ToastHost() {
    const items = useSyncExternalStore(subscribe, () => toasts);
    const insets = useSafeAreaInsets();

    return (
        <View
            pointerEvents="none"
            style={{ position: "absolute", left: spacing[4], right: spacing[4], bottom: insets.bottom + spacing[4], alignItems: "center", gap: spacing[2] }}
        >
            {items.map((item) => (
                <ToastView key={item.id} item={item} />
            ))}
        </View>
    );
}

function ToastView({ item }: { item: ToastItem }) {
    const { colors, shadows } = useTheme();
    const fade = useAnimatedValue(0);

    useEffect(() => {
        Animated.timing(fade, { toValue: 1, duration: motion.normal, useNativeDriver: true }).start();
    }, [fade]);

    const Icon = { info: Info, success: CircleCheck, error: CircleAlert }[item.type];
    const iconColor = { info: colors.foreground, success: colors.success, error: colors.danger }[item.type];

    return (
        <Animated.View
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            style={{
                opacity: fade,
                transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
                flexDirection: "row",
                alignItems: "center",
                gap: spacing[2],
                maxWidth: 360,
                paddingVertical: spacing[3],
                paddingHorizontal: spacing[4],
                borderRadius: radius.medium,
                backgroundColor: colors.content1,
                boxShadow: shadows.medium,
            }}
        >
            <Icon size={16} color={iconColor} />
            <Text variant="small" style={{ flexShrink: 1 }}>
                {item.message}
            </Text>
        </Animated.View>
    );
}
