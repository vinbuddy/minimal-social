import Image from "next/image";
import { useState } from "react";

import FullScreenMediaSlider from "./media/fullscreen-media-slider";
import { IMediaFile } from "@/types/post";
import { useVisibility } from "@/hooks";

interface IProps {
    images: IMediaFile[];
}

export default function GalleryImages({ images }: IProps) {
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
                mediaFiles={images ?? []}
            />
            <ul className="gallery w-full flex flex-wrap gap-2 list-none">
                {images.map((image, index) => (
                    <li className={`flex-grow rounded-2xl overflow-hidden h-[40vh]`} key={index}>
                        {image.type === "video" ? (
                            <></>
                        ) : (
                            <Image
                                onClick={() => handleMediaFileClick(index)}
                                className="object-cover min-w-full max-h-full align-bottom cursor-pointer"
                                src={image?.url}
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
