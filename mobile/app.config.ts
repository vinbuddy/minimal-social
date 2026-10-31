import { ConfigContext, ExpoConfig } from "expo/config";

/**
 * Extends app.json. The Google Sign-In config plugin refuses to build without an iOS URL scheme,
 * so it is only added when GOOGLE_IOS_URL_SCHEME is set (see .env.example).
 */
export default ({ config }: ConfigContext): ExpoConfig => {
    const iosUrlScheme = process.env.GOOGLE_IOS_URL_SCHEME;
    const plugins: ExpoConfig["plugins"] = [...(config.plugins ?? [])];

    if (iosUrlScheme) {
        plugins.push(["@react-native-google-signin/google-signin", { iosUrlScheme }]);
    }

    return { ...config, name: config.name ?? "Minimal Social", slug: config.slug ?? "minimal-social", plugins };
};
