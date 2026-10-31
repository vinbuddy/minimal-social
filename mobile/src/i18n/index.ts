import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { getItem, setItem, STORAGE_KEYS } from "@/lib/storage";

// Copied from client/public/locales: the web loads them over HTTP, the app bundles them
import enChat from "./locales/en/chat.json";
import enComment from "./locales/en/comment.json";
import enCommon from "./locales/en/common.json";
import enPost from "./locales/en/post.json";
import enReel from "./locales/en/reel.json";
import enUser from "./locales/en/user.json";
import viChat from "./locales/vi/chat.json";
import viComment from "./locales/vi/comment.json";
import viCommon from "./locales/vi/common.json";
import viPost from "./locales/vi/post.json";
import viReel from "./locales/vi/reel.json";
import viUser from "./locales/vi/user.json";

export const SUPPORTED_LANGUAGES = ["en", "vi"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

/** Same default as the web client */
const DEFAULT_LANGUAGE: Language = "vi";

const isSupported = (lng: string | null | undefined): lng is Language =>
    !!lng && (SUPPORTED_LANGUAGES as readonly string[]).includes(lng);

function getDeviceLanguage(): Language {
    const deviceLanguage = getLocales()[0]?.languageCode;
    return isSupported(deviceLanguage) ? deviceLanguage : DEFAULT_LANGUAGE;
}

i18n.use(initReactI18next).init({
    resources: {
        en: { common: enCommon, post: enPost, comment: enComment, user: enUser, chat: enChat, reel: enReel },
        vi: { common: viCommon, post: viPost, comment: viComment, user: viUser, chat: viChat, reel: viReel },
    },
    lng: getDeviceLanguage(),
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGUAGES,
    ns: ["common", "post", "comment", "user", "chat", "reel"],
    defaultNS: "common",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
});

/** A language picked in Settings wins over the device language */
export async function restoreLanguage() {
    const saved = await getItem(STORAGE_KEYS.language);
    if (isSupported(saved) && saved !== i18n.language) await i18n.changeLanguage(saved);
}

export async function changeLanguage(language: Language) {
    await i18n.changeLanguage(language);
    await setItem(STORAGE_KEYS.language, language);
}

export default i18n;
