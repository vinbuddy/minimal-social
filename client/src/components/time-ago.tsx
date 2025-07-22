"use client";
import { TIMAGE_UNIT_MAP, TIMEAGO_JUST_NOW_MAP, TIMEAGO_SUFFIX_MAP } from "@/constants/language";
import { formatTimeStamp } from "@/utils/datetime";
import { useTranslation } from "react-i18next";
import TimeAgoComponent, { Formatter } from "react-timeago";

interface IProps {
    date: string;
    className?: string;
}

function TimeAgo({ date, className }: IProps) {
    const { i18n } = useTranslation();

    const handleFormatter: Formatter = (value, unit, suffix, epochMilliseconds, nextFormatter) => {
        if (unit === "second" && value < 60) {
            return TIMEAGO_JUST_NOW_MAP[i18n.language] || "Just now";
        }

        const units = TIMAGE_UNIT_MAP[i18n.language];
        const suffixes = TIMEAGO_SUFFIX_MAP[i18n.language];

        if (suffix === "from now") {
            return `${value} ${units[unit]}`;
        }

        if (suffix === "ago") {
            return `${value} ${units[unit]} ${suffixes[suffix]}`;
        }

        return nextFormatter ? nextFormatter(value, unit, suffix, epochMilliseconds) : `${value} ${unit} ${suffix}`;
    };

    return (
        <TimeAgoComponent
            className={className}
            live={false}
            title={formatTimeStamp(date)}
            date={date}
            formatter={handleFormatter}
        />
    );
}

export default TimeAgo;
