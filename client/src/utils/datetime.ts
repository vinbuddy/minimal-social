import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import { t } from "i18next";

dayjs.extend(isToday);
dayjs.extend(isYesterday);

export const formatTimeStamp = (ISO8601String: string): string => {
    const dateTime = new Date(ISO8601String);

    // Get date components
    const year = dateTime.getFullYear();
    const month = String(dateTime.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(dateTime.getDate()).padStart(2, "0");

    // Get time components
    const hours = String(dateTime.getHours()).padStart(2, "0");
    const minutes = String(dateTime.getMinutes()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`;
    const formattedTime = `${hours}:${minutes}`;

    return `${formattedTime}, ${formattedDate}`;
};

export const formatDate = (ISO8601String: string): string => {
    if (dayjs(ISO8601String).isToday()) {
        return t("TODAY");
    }

    if (dayjs(ISO8601String).isYesterday()) {
        return t("YESTERDAY");
    }

    return dayjs(ISO8601String).format("DD-MM-YYYY");
};

export const formatTime = (ISO8601String: string): string => {
    return dayjs(ISO8601String).format("HH:mm");
};
