"use client";
import React from "react";
import NextImage from "next/image";
import { XIcon } from "lucide-react";
import cn from "classnames";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

import VideoPlayer from "./video-player";
import { IMediaFile } from "@/types/post";

interface IProps {
    mediaFiles: IMediaFile[];
    videoPreview: boolean;
    scrollHorizontally?: boolean;
    onRemoveMediaFile?: (index: number) => void;
    onMediaFileClick?: (index: number) => void;
}

function MediaFileSlider({
    mediaFiles,
    scrollHorizontally = true,
    videoPreview = true,
    onMediaFileClick,
    onRemoveMediaFile,
}: IProps) {
    return (
        <div className="media-file-slider">
            {mediaFiles?.length! > 0 && (
                <Swiper
                    modules={[Navigation, Mousewheel, A11y]}
                    spaceBetween={10}
                    slidesPerView="auto"
                    navigation={true}
                    allowTouchMove={false}
                    freeMode={true}
                    mousewheel={{
                        forceToAxis: !scrollHorizontally,
                    }}
                >
                    {mediaFiles?.map((file, index) => {
                        let aspectRatio = file.width / file.height;

                        return (
                            <SwiperSlide
                                key={index}
                                style={{
                                    aspectRatio: aspectRatio,
                                    flexGrow: aspectRatio === 1 ? "none" : `calc(${file.width} / ${file.height})`,
                                }}
                                className="rounded-xl group"
                            >
                                <div
                                    className={cn("h-full rounded-xl relative cursor-pointer", {
                                        "w-full": mediaFiles.length > 1,
                                        "!w-auto": mediaFiles.some((file) => file.type === "video"),
                                    })}
                                    onClick={() => !!onMediaFileClick && onMediaFileClick(index)}
                                >
                                    {file.type === "image" ? (
                                        <NextImage
                                            className="w-full h-auto block rounded-xl"
                                            src={file?.url}
                                            width={file.width}
                                            height={file.height}
                                            placeholder="blur"
                                            blurDataURL={file?.url}
                                            alt="Next Preview Image"
                                        />
                                    ) : (
                                        <>
                                            <VideoPlayer
                                                src={file.url}
                                                timeline={videoPreview && false}
                                                playOrPause={videoPreview && false}
                                                className="w-full h-full block rounded-xl"
                                            />
                                        </>
                                    )}

                                    {!!onRemoveMediaFile && (
                                        <button
                                            type="button"
                                            onClick={() => onRemoveMediaFile(index)}
                                            className="group-hover:visible invisible transition ease-linear absolute top-2 right-2 text-lg p-1 text-white bg-[#00000080] rounded-full"
                                        >
                                            <XIcon size={18} />
                                        </button>
                                    )}
                                </div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            )}
        </div>
    );
}

export default MediaFileSlider;
