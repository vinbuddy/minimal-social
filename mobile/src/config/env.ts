/**
 * Set in mobile/.env.local (see .env.example). On a physical device or Android emulator "localhost"
 * is the device itself: use your machine's LAN IP, or http://10.0.2.2:5000 on the Android emulator.
 */
export const ENV = {
    API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:5000",
    /** OAuth client of type "Web" (the server's GOOGLE_CLIENT_ID): the audience of the ID token */
    GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    /** OAuth client of type "iOS" */
    GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
};
