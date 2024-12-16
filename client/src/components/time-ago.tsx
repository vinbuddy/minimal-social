"use client";
import { formatTimeStamp } from "@/utils/datetime";
import TimeAgoComponent from "react-timeago";

interface IProps {
    date: string;
    className?: string;
}

function TimeAgo({ date, className }: IProps) {
    return <TimeAgoComponent className={className} live={false} title={formatTimeStamp(date)} date={date} />;
}

export default TimeAgo;
