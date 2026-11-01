import { Alert, Platform } from "react-native";

/** A native confirm dialog; react-native-web's Alert can't show buttons, so the web preview uses window.confirm */
export function confirm(options: { title: string; message?: string; confirmLabel: string; cancelLabel: string; destructive?: boolean }) {
    const { title, message, confirmLabel, cancelLabel, destructive = false } = options;

    if (Platform.OS === "web") {
        return Promise.resolve(globalThis.confirm?.([title, message].filter(Boolean).join("\n\n")) ?? false);
    }

    return new Promise<boolean>((resolve) => {
        Alert.alert(title, message, [
            { text: cancelLabel, style: "cancel", onPress: () => resolve(false) },
            { text: confirmLabel, style: destructive ? "destructive" : "default", onPress: () => resolve(true) },
        ]);
    });
}
