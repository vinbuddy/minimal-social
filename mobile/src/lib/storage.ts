import AsyncStorage from "@react-native-async-storage/async-storage";

/** Non-secret preferences (theme, language). Tokens go through token-storage.ts instead. */
export const STORAGE_KEYS = {
    theme: "pref:theme",
    language: "pref:language",
} as const;

export async function getItem(key: string): Promise<string | null> {
    try {
        return await AsyncStorage.getItem(key);
    } catch {
        return null;
    }
}

export async function setItem(key: string, value: string): Promise<void> {
    try {
        await AsyncStorage.setItem(key, value);
    } catch {
        // A lost preference is not worth crashing for
    }
}
