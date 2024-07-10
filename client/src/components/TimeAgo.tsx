"use client";
import { formatTimeStamp } from "@/utils/datetime";
import TimeAgoComponent from "react-timeago";

interface IProps {
    date: string;
}

function TimeAgo({ date }: IProps) {
    return <TimeAgoComponent live={false} title={formatTimeStamp(date)} date={date} />;
}

export default TimeAgo;
