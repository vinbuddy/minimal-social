"use client";

import InfiniteScroll from "react-infinite-scroll-component";
import { Spinner, Tab, Tabs } from "@nextui-org/react";
import Image from "next/image";
import { useState } from "react";

import FullScreenMediaSlider from "../media/fullscreen-media-slider";
import { usePagination, useVisibility } from "@/hooks";
import { IMediaFile } from "@/types/post";
import VideoPlayer from "../media/video-player";

interface IProps {
    conversationId: string;
}

export default function ConversationStorage({ conversationId }: IProps) {
    const {
        data: mediaFiles,
        error,
        isReachedEnd,
        size,
        isLoading,
        setSize: setPage,
    } = usePagination<IMediaFile>(`/conversation/storage/media-file?conversationId=${conversationId}`);

    const { isVisible: open, show: showFullscreenSlider, hide: hideFullscreenSlider } = useVisibility();
    const [activeIndex, setActiveIndex] = useState<number>(0);

    const handleMediaFileClick = (index: number) => {
        setActiveIndex(index);
        showFullscreenSlider();
    };

    const renderMediaFiles = () => {
        if (error && !isLoading) {
            return <p className="text-center text-danger">{error?.message}</p>;
        }

        if (mediaFiles.length === 0 && !isLoading && !error) {
            return <p className="text-center">No media files yet</p>;
        }

        return (
            <>
                <div>
                    {mediaFiles.length > 0 && (
                        <InfiniteScroll
                            className="grid grid-cols-3 gap-2 items-center"
                            scrollableTarget="conversation-list"
                            next={() => setPage(size + 1)}
                            hasMore={!isReachedEnd}
                            loader={
                                <div className="flex justify-center items-center overflow-hidden h-[70px]">
                                    <Spinner size="md" />
                                </div>
                            }
                            dataLength={mediaFiles?.length ?? 0}
                        >
                            {mediaFiles.map((mediaFile, index) => (
                                <div
                                    className="mb-2 last:mb-0"
                                    key={mediaFile.publicId}
                                    onClick={() => handleMediaFileClick(index)}
                                >
                                    {mediaFile.type === "image" ? (
                                        <Image
                                            className="rounded-lg cursor-pointer"
                                            width={mediaFile.width}
                                            height={mediaFile.height}
                                            src={mediaFile.url}
                                            alt="media"
                                        />
                                    ) : (
                                        <VideoPlayer
                                            className="rounded-lg cursor-pointer"
                                            src={mediaFile.url}
                                            showVolume={false}
                                            timeline={false}
                                            autoPlay={false}
                                            playOrPause={true}
                                            isThumbnail={true}
                                        />
                                    )}
                                </div>
                            ))}
                        </InfiniteScroll>
                    )}
                </div>

                {isLoading && (
                    <div className="flex justify-center items-center overflow-hidden h-[70px]">
                        <Spinner size="md" />
                    </div>
                )}
            </>
        );
    };

    return (
        <div>
            <FullScreenMediaSlider
                onHide={hideFullscreenSlider}
                isOpen={open}
                activeSlideIndex={activeIndex}
                mediaFiles={mediaFiles}
            />
            <div>
                <Tabs className="sticky top-[76px] bg-content1 pb-4 z-10" fullWidth size="md">
                    <Tab key="media" title="Media files">
                        <div>{renderMediaFiles()}</div>
                    </Tab>
                    <Tab key="file" title="Files" />
                    <Tab key="link" title="Links" />
                </Tabs>
            </div>
        </div>
    );
}
