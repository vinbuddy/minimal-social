import { ILanguageOption } from "@/types/translation";

export const LANGUAGE_OPTIONS: ILanguageOption[] = [
    { value: "en", label: "English", flag: "/images/flags/en.png" },
    { value: "vi", label: "Tiếng Việt", flag: "/images/flags/vn.png" },
];

export const TIMEAGO_JUST_NOW_MAP: Record<string, string> = {
    vi: "Vừa xong",
    en: "Just now",
};

export const TIMAGE_UNIT_MAP: Record<string, Record<string, string>> = {
    vi: {
        second: "giây",
        minute: "phút",
        hour: "giờ",
        day: "ngày",
        week: "tuần",
        month: "tháng",
        year: "năm",
    },
    en: {
        second: "second",
        minute: "minute",
        hour: "hour",
        day: "day",
        week: "week",
        month: "month",
        year: "year",
    },
};

export const TIMEAGO_SUFFIX_MAP: Record<string, Record<string, string>> = {
    vi: {
        ago: "trước",
        "from now": "bây giờ",
    },
    en: {
        ago: "ago",
        "from now": "from now",
    },
};
