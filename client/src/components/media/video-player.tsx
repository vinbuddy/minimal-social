"use client";
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Slider, SliderValue } from "@heroui/react";
import { PlayIcon, Volume1Icon, VolumeXIcon } from "lucide-react";

interface IProps {
    src: string;
    className?: string;
    timeline?: boolean;
    loop?: boolean;
    autoPlay?: boolean;
    playOrPause?: boolean;
    showVolume?: boolean;
    isThumbnail?: boolean;
    inViewOptions?: IntersectionObserverInit;
}

function VideoPlayer(
    {
        src,
        loop = true,
        autoPlay = true,
        timeline = true,
        playOrPause = true,
        showVolume = true,
        isThumbnail = false,
        className = "w-full h-auto rounded-xl",
        inViewOptions = { root: null, rootMargin: "0px", threshold: 0.5 },
        ...props
    }: IProps,
    ref: React.ForwardedRef<HTMLVideoElement>
) {
    const [playing, setPlaying] = useState<boolean>(false);
    const [muted, setMuted] = useState<boolean>(true);

    const [currentTime, setCurrentTime] = useState<[number, number]>([0, 0]);
    const [duration, setDuration] = useState<[number, number]>([0, 0]);
    const [durationSec, setDurationSec] = useState<number>(0);
    const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);

    const videoRef = useRef<HTMLVideoElement | null>(null);

    const sec2Min = (sec: number): { min: number; sec: number } => {
        const min = Math.floor(sec / 60);
        const secRemain = Math.floor(sec % 60);

        return {
            min: min || 0,
            sec: secRemain || 0,
        };
    };

    useEffect(() => {
        if (videoRef.current) {
            const { min, sec } = sec2Min(videoRef.current.duration);

            setDurationSec(videoRef.current.duration);
            setDuration([min, sec]);
        }
    }, [currentTimeSec, durationSec]);

    useEffect(() => {
        const videoElement = videoRef.current;

        if (!videoElement) return;

        const handlePlay = (): void => setPlaying(true);

        const handlePause = (): void => setPlaying(false);

        videoElement.addEventListener("play", handlePlay);
        videoElement.addEventListener("pause", handlePause);

        return () => {
            videoElement.removeEventListener("play", handlePlay);
            videoElement.removeEventListener("pause", handlePause);
        };
    }, []);

    // Handle play - pause video in - out viewport
    useEffect(() => {
        const handleVideoInViewport: IntersectionObserverCallback = (entries) => {
            entries.forEach((entry) => {
                if (!videoRef.current) {
                    return;
                }

                if (entry.isIntersecting) {
                    if (autoPlay) {
                        videoRef.current.play();
                        setPlaying(true);
                    } else {
                        videoRef.current.pause();
                        setPlaying(false);
                    }
                } else {
                    videoRef.current.pause();
                    setPlaying(false);
                }
            });
        };
        const observer = new IntersectionObserver(handleVideoInViewport, inViewOptions);

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => {
            if (videoRef.current) {
                observer.unobserve(videoRef.current);
            }
        };
    }, [autoPlay]);

    const handlePlay = (): void => {
        if (playing) {
            videoRef.current?.pause();
            setPlaying(false);
        } else {
            videoRef.current?.play();
            setPlaying(true);
        }
    };

    const handleToggleMute = (e?: React.MouseEvent<HTMLButtonElement>): void => {
        if (e) e.stopPropagation();

        if (videoRef.current) {
            videoRef.current.muted = !muted;
            setMuted(!muted);
        }
    };

    const handleTimeUpdate = (): void => {
        if (!playing) return;

        if (videoRef.current) {
            const { min, sec } = sec2Min(videoRef.current.currentTime);
            setCurrentTimeSec(videoRef.current?.currentTime);
            setCurrentTime([min, sec]);
        }
    };

    const handleSeek = (value: SliderValue): void => {
        if (videoRef.current) {
            videoRef.current.currentTime = Number(value);
            handleTimeUpdate();
        }
    };

    const handleKeepCurrentTime = (): void => {
        // if (videoRef.current) {
        //     videoRef.current.muted = true;
        //     setMuted(true);
        // }
    };

    const renderPlayPauseButton = () => {
        if (playOrPause && isThumbnail) {
            return (
                <div className="absolute flex items-center justify-center cursor-pointer top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <button className={`rounded-full p-5 bg-[rgba(0,0,0,0.5)] scale-100 visible transition-all`}>
                        <PlayIcon fill="#fff" className="text-white text-xl" />
                    </button>
                </div>
            );
        }

        if (playOrPause && !isThumbnail) {
            return (
                <div
                    onClick={handlePlay}
                    className="absolute flex items-center justify-center cursor-pointer top-0 left-0 right-0 bottom-20"
                >
                    <button
                        className={`rounded-full p-5 bg-[rgba(0,0,0,0.5)] scale-0 invisible transition-all ${
                            !playing ? "!scale-100 !visible" : ""
                        }`}
                    >
                        <PlayIcon fill="#fff" className="text-white text-xl" />
                    </button>
                </div>
            );
        }
    };

    useImperativeHandle(ref, () => videoRef.current!, []);

    return (
        <div onClick={handleKeepCurrentTime} className={`${className} relative overflow-hidden`}>
            <video
                onTimeUpdate={handleTimeUpdate}
                ref={videoRef}
                autoPlay={autoPlay}
                loop={loop}
                className="w-full h-full block"
                src={src}
                muted={muted}
                controls={false}
                {...props}
            >
                <source src={src} type="video/mp4" />
            </video>
            {/* Controls Overlay */}
            <div className="absolute top-0 left-0 w-full h-full bg-transparent">
                {/* Pause - Play button */}
                {renderPlayPauseButton()}

                {/* Muted Toggle button */}
                {showVolume && (
                    <div className={`absolute right-3 ${!timeline ? "bottom-3" : "bottom-10"}`}>
                        <button onClick={handleToggleMute} className=" rounded-full p-2 bg-[rgba(0,0,0,0.5)]">
                            {muted ? (
                                <VolumeXIcon size={18} className="text-white" />
                            ) : (
                                <Volume1Icon size={18} className="text-white" />
                            )}
                        </button>
                    </div>
                )}

                {/* Range timeline */}
                {timeline && (
                    <div className="flex items-center absolute bottom-0 left-0 w-full px-3">
                        <div className="flex-1">
                            <Slider
                                size="sm"
                                hideThumb={true}
                                value={currentTimeSec}
                                maxValue={durationSec}
                                minValue={0}
                                onChange={handleSeek}
                            />
                        </div>
                        <div className="text-white text-sm  rounded-full ps-2">
                            {currentTime[0]}:{currentTime[1]} / {duration[0]}:{duration[1]}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default forwardRef(VideoPlayer);
