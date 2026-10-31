/**
 * Set in mobile/.env.local (see .env.example). On a physical device or Android emulator "localhost"
 * is the device itself: use your machine's LAN IP, or http://10.0.2.2:5000 on the Android emulator.
 */
export const ENV = {
    API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:5000",
};
