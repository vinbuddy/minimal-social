import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export type AuthTokens = { accessToken: string; refreshToken: string };

const ACCESS_TOKEN_KEY = "auth.accessToken";
const REFRESH_TOKEN_KEY = "auth.refreshToken";

// SecureStore has no web implementation; web is only used for development previews
const isWeb = Platform.OS === "web";

async function read(key: string) {
    if (isWeb) return globalThis.localStorage?.getItem(key) ?? null;
    return SecureStore.getItemAsync(key);
}

async function write(key: string, value: string) {
    if (isWeb) return globalThis.localStorage?.setItem(key, value);
    return SecureStore.setItemAsync(key, value);
}

async function remove(key: string) {
    if (isWeb) return globalThis.localStorage?.removeItem(key);
    return SecureStore.deleteItemAsync(key);
}

export async function getTokens(): Promise<AuthTokens | null> {
    const [accessToken, refreshToken] = await Promise.all([read(ACCESS_TOKEN_KEY), read(REFRESH_TOKEN_KEY)]);
    return accessToken && refreshToken ? { accessToken, refreshToken } : null;
}

export async function getAccessToken() {
    return read(ACCESS_TOKEN_KEY);
}

export async function saveTokens({ accessToken, refreshToken }: AuthTokens) {
    await Promise.all([write(ACCESS_TOKEN_KEY, accessToken), write(REFRESH_TOKEN_KEY, refreshToken)]);
}

export async function clearTokens() {
    await Promise.all([remove(ACCESS_TOKEN_KEY), remove(REFRESH_TOKEN_KEY)]);
}
