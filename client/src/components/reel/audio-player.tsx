"use client";
import { useEffect, useRef, useState } from "react";
import { Slider } from "@heroui/react";
import { PauseIcon, PlayIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { formatDuration } from "@/utils/reel";

interface IProps {
    src: string;
    duration?: number;
}

export default function AudioPlayer({ src, duration: initialDuration = 0 }: IProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(initialDuration);
    const { t: tReel } = useTranslation("reel");

    useEffect(() => {
        const audio = audioRef.current;
        return () => audio?.pause();
    }, []);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (audio.paused) audio.play().catch(() => {});
        else audio.pause();
    };

    const handleSeek = (value: number | number[]) => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.currentTime = Array.isArray(value) ? value[0] : value;
        setCurrentTime(audio.currentTime);
    };

    return (
        <div className="flex items-center gap-3">
            <audio
                ref={audioRef}
                src={src}
                preload="metadata"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
                onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || initialDuration)}
            />

            <button
                type="button"
                aria-label={isPlaying ? tReel("REEL_PAUSE") : tReel("REEL_PLAY")}
                onClick={togglePlay}
                className="flex items-center justify-center size-8 rounded-full outline-none hover:bg-content2 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
            >
                {isPlaying ? <PauseIcon size={16} fill="currentColor" /> : <PlayIcon size={16} fill="currentColor" />}
            </button>

            <Slider
                aria-label={tReel("AUDIO.TITLE")}
                size="sm"
                color="foreground"
                minValue={0}
                maxValue={duration || 1}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1"
            />

            <span className="text-tiny text-default-500 tabular-nums w-10 text-end">
                {formatDuration(isPlaying || currentTime > 0 ? currentTime : duration)}
            </span>
        </div>
    );
}
