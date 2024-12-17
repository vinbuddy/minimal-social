"use client";
import React from "react";

import { IMediaFile } from "@/types/post";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import NextImage from "next/image";
import { XIcon } from "lucide-react";
import VideoPlayer from "./video-player";
import { Image } from "@nextui-org/react";

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
        <div className={`media-file-slider`}>
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
                                    // aspect ratio = 1 / 1 unset aspectRatio property
                                    flexGrow: aspectRatio === 1 ? "none" : `calc(${file.width} / ${file.height})`,
                                }}
                                className="rounded-xl group"
                            >
                                <div
                                    className={`${mediaFiles.length > 1 && "w-full"} ${
                                        mediaFiles.some((file) => file.type === "video") ? "!w-auto" : ""
                                    } h-full rounded-xl relative cursor-pointer`}
                                    onClick={() => !!onMediaFileClick && onMediaFileClick(index)}
                                >
                                    {file.type === "image" ? (
                                        onRemoveMediaFile ? (
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
                                            <Image
                                                classNames={{ wrapper: "h-full", img: "!h-full" }}
                                                as={NextImage}
                                                className="w-full h-auto block rounded-xl"
                                                src={file?.url}
                                                width={file.width}
                                                height={file.height}
                                                placeholder="blur"
                                                blurDataURL={file?.url}
                                                alt="Preview Image"
                                            />
                                        )
                                    ) : (
                                        // <NextImage
                                        //     // as={NextImage}
                                        //     className="w-full h-auto block rounded-lg"
                                        //     src={file?.url}
                                        //     width={file.width}
                                        //     height={file.height}
                                        //     placeholder="blur"
                                        //     blurDataURL={file?.url}
                                        //     alt="Preview Image"
                                        // />
                                        // onRemoveMediaFile ? (
                                        //     <NextImage
                                        //         className="w-full h-auto block rounded-lg"
                                        //         src={file?.url}
                                        //         width={file.width}
                                        //         height={file.height}
                                        //         placeholder="blur"
                                        //         blurDataURL={file?.url}
                                        //         alt="Preview Image"
                                        //     />
                                        // ) : (
                                        //     <Image
                                        //         as={NextImage}
                                        //         className="w-full h-auto block rounded-lg"
                                        //         src={file?.url}
                                        //         width={file.width}
                                        //         height={file.height}
                                        //         placeholder="blur"
                                        //         blurDataURL={file?.url}
                                        //         alt="Preview Image"
                                        //     />
                                        // )
                                        <>
                                            <VideoPlayer
                                                src={file.url}
                                                timeline={videoPreview && false}
                                                playOrPause={videoPreview && true}
                                                className="w-full h-full block rounded-xl"
                                            />
                                        </>
                                    )}

                                    {!!onRemoveMediaFile && (
                                        <button
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
