"use client";
import { formatTimeStamp } from "@/utils/datetime";
import TimeAgoComponent, { Formatter } from "react-timeago";

interface IProps {
    date: string;
    className?: string;
}

function TimeAgo({ date, className }: IProps) {
    const handleFormatter: Formatter = (value, unit, suffix, epochMilliseconds, nextFormatter) => {
        if (unit === "second" && value < 60) {
            return "just now";
        }

        if (suffix === "from now") {
            return `${value} ${unit}`;
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
