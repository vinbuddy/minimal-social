// lib/i18n.ts
import i18n from "i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

i18n.use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        lng: "vi",
        fallbackLng: "en",
        supportedLngs: ["en", "vi"],
        ns: ["common", "post", "comment", "user", "chat"],
        defaultNS: "common",
        backend: {
            loadPath: "/locales/{{lng}}/{{ns}}.json",
        },
        debug: false,
        detection: {
            order: ["querystring", "cookie", "localStorage", "navigator"],
            caches: ["localStorage"],
        },
        react: {
            useSuspense: false,
        },
    });

export default i18n;
