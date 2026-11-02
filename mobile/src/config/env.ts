import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * In development the API runs on the same machine as Metro, so the app reaches it through the host it loaded the
 * bundle from (the LAN IP on a phone, which changes with the network). Set EXPO_PUBLIC_API_BASE_URL to override.
 */
function devApiBaseUrl(): string | undefined {
    if (!__DEV__) return undefined;

    const host = Platform.OS === "web" ? globalThis.location?.hostname : Constants.expoConfig?.hostUri?.split(":")[0];
    return host ? `http://${host}:${process.env.EXPO_PUBLIC_API_PORT ?? "5000"}` : undefined;
}

export const ENV = {
    API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || devApiBaseUrl() || "http://localhost:5000",
    /** The web client's origin, for shareable post links. Unset hides "Copy link" */
    WEB_URL: process.env.EXPO_PUBLIC_WEB_URL,
    /** OAuth client of type "Web" (the server's GOOGLE_CLIENT_ID): the audience of the ID token */
    GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    /** OAuth client of type "iOS" */
    GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
};
