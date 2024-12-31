import Image from "next/image";
import { useState } from "react";

import FullScreenMediaSlider from "./fullscreen-media-slider";
import { IMediaFile } from "@/types/post";
import { useVisibility } from "@/hooks";
import VideoPlayer from "./video-player";

interface IProps {
    mediaFiles: IMediaFile[];
}

export default function GalleryMediaFiles({ mediaFiles }: IProps) {
    const { isVisible: open, show: showFullscreenSlider, hide: hideFullscreenSlider } = useVisibility();
    const [activeIndex, setActiveIndex] = useState<number>(0);

    const handleMediaFileClick = (index: number) => {
        setActiveIndex(index);
        showFullscreenSlider();
    };

    return (
        <>
            <FullScreenMediaSlider
                onHide={hideFullscreenSlider}
                isOpen={open}
                activeSlideIndex={activeIndex}
                mediaFiles={mediaFiles ?? []}
            />
            <ul className="gallery w-full flex flex-wrap gap-2 list-none">
                {mediaFiles.map((file, index) => (
                    <li
                        onClick={() => handleMediaFileClick(index)}
                        className="flex-grow rounded-2xl overflow-hidden h-[40vh] cursor-pointer"
                        key={index}
                    >
                        {file.type === "video" ? (
                            <>
                                <VideoPlayer
                                    showVolume={false}
                                    playOrPause={false}
                                    src={file.url}
                                    className="w-full h-full block rounded-xl"
                                />
                            </>
                        ) : (
                            <Image
                                className="object-cover min-w-full max-h-full align-bottom cursor-pointer"
                                src={file?.url}
                                alt=""
                                width={0}
                                height={0}
                                sizes="100vw"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                }}
                            />
                        )}
                    </li>
                ))}
            </ul>
        </>
    );
}
