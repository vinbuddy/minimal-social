"use client";
import { useEffect, useRef, useState } from "react";
import { Spinner } from "@heroui/react";
import { PlayIcon, Volume2Icon, VolumeXIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { HeartIcon } from "@/assets/icons";
import { useReelStore } from "@/hooks/store";
import { IReelVideo } from "@/types/reel";
import { getVideoFit } from "@/utils/reel";

interface IProps {
    video: IReelVideo;
    isActive: boolean;
    preload: "auto" | "metadata" | "none";
    onDoubleTap?: () => void;
}

const DOUBLE_TAP_DELAY = 250;
// A short stall is normal while seeking; only show the spinner for real buffering
const BUFFERING_SPINNER_DELAY = 400;

export default function ReelPlayer({ video, isActive, preload, onDoubleTap }: IProps) {
    const { muted, toggleMuted } = useReelStore();
    const { t: tReel } = useTranslation("reel");

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const progressRef = useRef<HTMLDivElement | null>(null);
    const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const bufferingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [isPausedByUser, setIsPausedByUser] = useState<boolean>(false);
    const [isBuffering, setIsBuffering] = useState<boolean>(false);
    const [isReady, setIsReady] = useState<boolean>(false);
    const [heartKey, setHeartKey] = useState<number>(0);

    const fit = getVideoFit(video.width, video.height);

    // Only the reel in view plays; the others rewind so they start fresh when scrolled back to
    useEffect(() => {
        const element = videoRef.current;
        if (!element) return;

        if (isActive) {
            setIsPausedByUser(false);
            element.play().catch(() => {
                // Autoplay with sound can be blocked until the user interacts: fall back to muted
                if (!element.muted) {
                    element.muted = true;
                    useReelStore.setState({ muted: true });
                    element.play().catch(() => setIsPausedByUser(true));
                }
            });
        } else {
            element.pause();
            element.currentTime = 0;
        }
    }, [isActive, preload]);

    useEffect(() => {
        if (videoRef.current) videoRef.current.muted = muted;
    }, [muted]);

    // Drive the progress bar from requestAnimationFrame: smooth, and no re-render per frame
    useEffect(() => {
        if (!isActive) return;

        let frame: number;
        const tick = () => {
            const element = videoRef.current;
            if (element && progressRef.current && element.duration) {
                progressRef.current.style.transform = `scaleX(${element.currentTime / element.duration})`;
            }
            frame = requestAnimationFrame(tick);
        };

        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [isActive]);

    useEffect(() => {
        return () => {
            if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
            if (bufferingTimeoutRef.current) clearTimeout(bufferingTimeoutRef.current);
        };
    }, []);

    const togglePlay = () => {
        const element = videoRef.current;
        if (!element) return;

        if (element.paused) {
            element.play().catch(() => {});
            setIsPausedByUser(false);
        } else {
            element.pause();
            setIsPausedByUser(true);
        }
    };

    // One tap pauses, two taps like: wait briefly to tell them apart
    const handleTap = () => {
        if (tapTimeoutRef.current) {
            clearTimeout(tapTimeoutRef.current);
            tapTimeoutRef.current = null;

            setHeartKey((key) => key + 1);
            onDoubleTap && onDoubleTap();
            return;
        }

        tapTimeoutRef.current = setTimeout(() => {
            tapTimeoutRef.current = null;
            togglePlay();
        }, DOUBLE_TAP_DELAY);
    };

    const handleWaiting = () => {
        if (bufferingTimeoutRef.current) clearTimeout(bufferingTimeoutRef.current);
        bufferingTimeoutRef.current = setTimeout(() => setIsBuffering(true), BUFFERING_SPINNER_DELAY);
    };

    const handlePlaying = () => {
        if (bufferingTimeoutRef.current) clearTimeout(bufferingTimeoutRef.current);
        setIsBuffering(false);
        setIsReady(true);
    };

    const handleSeek = (event: React.PointerEvent<HTMLDivElement>) => {
        const element = videoRef.current;
        if (!element || !element.duration) return;

        const rect = event.currentTarget.getBoundingClientRect();
        const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
        element.currentTime = ratio * element.duration;
    };

    return (
        <div className="absolute inset-0 overflow-hidden bg-black select-none">
            {/* Letterboxed videos sit on a blurred copy of their own frame instead of flat black */}
            {fit === "contain" && (
                <img
                    src={video.thumbnailUrl}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-50"
                />
            )}

            {/* The poster stays until the first frame plays, so there is never a black flash */}
            <img
                src={video.thumbnailUrl}
                alt=""
                aria-hidden
                className={`absolute inset-0 w-full h-full transition-opacity duration-200 ${
                    fit === "cover" ? "object-cover" : "object-contain"
                } ${isReady ? "opacity-0" : "opacity-100"}`}
            />

            {preload !== "none" && (
                <video
                    ref={videoRef}
                    src={video.url}
                    poster={video.thumbnailUrl}
                    preload={preload}
                    muted={muted}
                    loop
                    playsInline
                    disablePictureInPicture
                    controls={false}
                    onWaiting={handleWaiting}
                    onPlaying={handlePlaying}
                    onCanPlay={() => setIsReady(true)}
                    className={`absolute inset-0 w-full h-full ${fit === "cover" ? "object-cover" : "object-contain"}`}
                />
            )}

            {/* Tap layer */}
            <div onClick={handleTap} className="absolute inset-0 cursor-pointer" aria-hidden />

            {isActive && isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Spinner color="white" size="lg" />
                </div>
            )}

            {isPausedByUser && !isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span
                        aria-label={tReel("REEL_PLAY")}
                        className="flex items-center justify-center size-20 rounded-full bg-black/40 text-white"
                    >
                        <PlayIcon size={34} fill="currentColor" className="ms-1" />
                    </span>
                </div>
            )}

            {heartKey > 0 && (
                <span
                    key={heartKey}
                    className="reel-heart-pop absolute top-1/2 left-1/2 text-white drop-shadow-lg pointer-events-none"
                >
                    <HeartIcon isFilled size={96} />
                </span>
            )}

            <button
                type="button"
                aria-label={muted ? tReel("REEL_UNMUTE") : tReel("REEL_MUTE")}
                onClick={toggleMuted}
                className="absolute bottom-5 right-3 z-[2] flex items-center justify-center size-8 rounded-full bg-black/40 text-white outline-none transition-opacity hover:bg-black/60 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
            >
                {muted ? <VolumeXIcon size={16} /> : <Volume2Icon size={16} />}
            </button>

            {/* Progress: a hairline that grows to a scrubber on hover */}
            <div
                onPointerDown={handleSeek}
                className="group absolute bottom-0 left-0 right-0 z-[2] h-3 flex items-end cursor-pointer"
            >
                <div className="w-full h-0.5 group-hover:h-1 bg-white/30 transition-[height] duration-150">
                    <div ref={progressRef} className="h-full bg-white origin-left" style={{ transform: "scaleX(0)" }} />
                </div>
            </div>
        </div>
    );
}
