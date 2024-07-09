"use client";
import { useRef, useState } from "react";

import { IMediaFile } from "@/types/post";
import { Swiper, SwiperSlide } from "swiper/react";
import NextImage from "next/image";
import VideoPlayer from "./VideoPlayer";

import { XIcon } from "lucide-react";

import { Navigation, A11y, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import useVideoStore from "@/hooks/store/useVideoStore";

interface IProps {
    mediaFiles: IMediaFile[];
    isOpen: boolean;
    activeSlideIndex?: number;
    onHide?: () => void;
}

function FullScreenMediaSlider({ isOpen = false, activeSlideIndex = 0, mediaFiles, onHide = () => {} }: IProps) {
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const [activeSlide, setActiveSlide] = useState<number>(activeSlideIndex);
    const { turnOffFullscreenVideo } = useVideoStore();

    const handleHide = (): void => {
        onHide();

        // Turn off fullscreen
        const currentSlide = videoRefs.current[activeSlide];

        if (mediaFiles[activeSlide].type === "video" && currentSlide) {
            turnOffFullscreenVideo(currentSlide?.src);
        }
    };

    return (
        <div
            className={`animate-[fadeIn_0.2s_ease-in] fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-center w-screen h-screen bg-black ${
                isOpen ? "flex" : "hidden"
            }`}
        >
            {/* Exit button */}
            <button
                onClick={handleHide}
                className="animation-tap absolute top-4 left-2.5 cursor-pointer z-10 rounded-full p-3 bg-[#1e1e1e]"
            >
                <XIcon className="text-[#777] text-xl" />
            </button>

            <Swiper
                className="w-full"
                initialSlide={activeSlideIndex}
                modules={[Navigation, Mousewheel, A11y]}
                spaceBetween={10}
                slidesPerView="auto"
                navigation={true}
                mousewheel={{
                    forceToAxis: true,
                }}
                allowTouchMove={false}
                speed={650}
                onSlideChange={(swiper) => {
                    const { activeIndex, previousIndex } = swiper;

                    setActiveSlide(activeIndex);

                    const prevVideoSlide: HTMLVideoElement | null = videoRefs.current[previousIndex];

                    const currentVideoSlide: HTMLVideoElement | null = videoRefs.current[activeIndex];

                    // If prev video slide is not paused -> pause
                    if (prevVideoSlide?.paused === false) {
                        prevVideoSlide.pause();
                    }
                    // If current video slide is paused  -> play
                    if (currentVideoSlide?.paused === true) {
                        currentVideoSlide.play();
                    }
                }}
            >
                {mediaFiles.map((file, index) => {
                    return (
                        <SwiperSlide key={index} className="!flex justify-center w-full">
                            {file.type === "image" ? (
                                <NextImage
                                    className="w-fit h-auto block"
                                    src={file?.url}
                                    width={file.width}
                                    height={file.height}
                                    placeholder="blur"
                                    alt=""
                                />
                            ) : (
                                <VideoPlayer
                                    ref={(ref) => {
                                        videoRefs.current[index] = ref;
                                    }}
                                    className="max-w-full w-fit h-full rounded-none"
                                    src={file?.url}
                                />
                            )}
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
}

export default FullScreenMediaSlider;
