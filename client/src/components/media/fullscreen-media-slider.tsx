"use client";
import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import NextImage from "next/image";
import { XIcon } from "lucide-react";
import { Button } from "@heroui/react";
import { Navigation, A11y, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

import { IMediaFile } from "@/types/post";
import VideoPlayer from "./video-player";

interface IProps {
    mediaFiles: IMediaFile[];
    isOpen: boolean;
    activeSlideIndex?: number;
    onHide?: () => void;
}

function FullScreenMediaSlider({ isOpen = false, activeSlideIndex = 0, mediaFiles, onHide = () => {} }: IProps) {
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const [activeSlide, setActiveSlide] = useState<number>(activeSlideIndex);
    const swiperRef = useRef<any>(null);

    useEffect(() => {
        if (swiperRef.current && isOpen) {
            swiperRef.current.slideTo(activeSlideIndex, 0); // Transition instantly
        }

        // Play video if active slide is video and is open
        const currentSlide = videoRefs.current[activeSlide];
        if (!currentSlide) return;

        if (mediaFiles[activeSlide].type === "video" && currentSlide) {
            currentSlide.play();
        }
    }, [activeSlideIndex, isOpen]);

    const handleHide = (): void => {
        onHide();

        // Turn off fullscreen
        const currentSlide = videoRefs.current[activeSlide];

        if (mediaFiles[activeSlide].type === "video" && currentSlide) {
            currentSlide.pause();
            currentSlide.muted = true;

            // Reset time to 0
            currentSlide.currentTime = 0;
        }

        // set active slide to 0
        setActiveSlide(0);
    };

    return (
        <div
            className={`animate-[fadeIn_0.2s_ease-in] fixed top-0 left-0 right-0 bottom-0 z-20 flex justify-center bg-black fade ${
                isOpen ? "show pointer-events-auto" : "pointer-events-none"
            }`}
        >
            {/* Exit button */}
            <Button
                className="absolute top-4 right-2.5 z-10"
                isIconOnly
                color="default"
                radius="full"
                onPress={handleHide}
            >
                <XIcon className="text-[#777] text-xl" />
            </Button>

            <Swiper
                ref={swiperRef}
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
                onSwiper={(swiperInstance) => {
                    swiperRef.current = swiperInstance;
                }}
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
                                    blurDataURL={file?.url}
                                    alt=""
                                />
                            ) : (
                                <VideoPlayer
                                    ref={(ref) => {
                                        videoRefs.current[index] = ref;
                                    }}
                                    className="max-w-full w-fit h-full rounded-none"
                                    src={file?.url}
                                    autoPlay={index === activeSlideIndex}
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
