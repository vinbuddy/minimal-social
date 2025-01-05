"use client";

import InfiniteScroll from "react-infinite-scroll-component";
import { Chip, Spinner, Tab, Tabs } from "@nextui-org/react";
import Image from "next/image";
import { useState } from "react";

import FullScreenMediaSlider from "../media/fullscreen-media-slider";
import { usePagination, useVisibility } from "@/hooks";
import { IMediaFile } from "@/types/post";
import VideoPlayer from "../media/video-player";
import { IMessageLink } from "@/types/message";
import { formatDate } from "@/utils/datetime";
import { LinkIcon } from "lucide-react";

interface IProps {
    conversationId: string;
    tab: string;
}

export default function ConversationStorage({ conversationId, tab }: IProps) {
    const [storageTab, setStorageTab] = useState<string>(tab);

    const {
        data: mediaFiles,
        error,
        isReachedEnd,
        size,
        isLoading,
        setSize: setPage,
    } = usePagination<IMediaFile>(`/conversation/storage/media-file?conversationId=${conversationId}`);

    const {
        data: messageLinks,
        error: linkError,
        isReachedEnd: linkIsReachedEnd,
        size: linkPageSize,
        isLoading: linkIsLoading,
        setSize: setLinkPage,
    } = usePagination<IMessageLink>(`/conversation/storage/link?conversationId=${conversationId}`);

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

    const renderLinks = () => {
        if (linkError && !linkIsLoading) {
            return <p className="text-center text-danger">{linkError?.message}</p>;
        }

        if (messageLinks.length === 0 && !linkIsLoading && !linkError) {
            return <p className="text-center">No links yet</p>;
        }

        return (
            <>
                <div>
                    {messageLinks.length > 0 && (
                        <InfiniteScroll
                            scrollableTarget="conversation-list"
                            next={() => setLinkPage(linkPageSize + 1)}
                            hasMore={!linkIsReachedEnd}
                            loader={
                                <div className="flex justify-center items-center overflow-hidden h-[70px]">
                                    <Spinner size="md" />
                                </div>
                            }
                            dataLength={messageLinks?.length ?? 0}
                        >
                            {messageLinks.map((msgLink) => (
                                <div
                                    className="last:mb-0 py-4 border-b-2 border-default last:border-none first:pt-0"
                                    key={msgLink?.createdAt}
                                >
                                    <Chip className="mb-3" variant="bordered">
                                        {formatDate(msgLink?.createdAt)}
                                    </Chip>
                                    <ul>
                                        {msgLink?.links.map((link, index) => (
                                            <li className="flex items-center" key={index}>
                                                <LinkIcon size={16} className="mr-2" />
                                                <a
                                                    className="text-link underline"
                                                    href={link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {link}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </InfiniteScroll>
                    )}
                </div>

                {linkIsLoading && (
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
                <Tabs
                    className="sticky top-[76px] bg-content1 pb-4 z-10"
                    fullWidth
                    size="md"
                    selectedKey={storageTab}
                    onSelectionChange={(key) => setStorageTab(key.toString() as typeof storageTab)}
                >
                    <Tab key="media" title="Media files">
                        <div>{renderMediaFiles()}</div>
                    </Tab>
                    <Tab key="file" title="Files" />
                    <Tab key="link" title="Links">
                        <div>{renderLinks()}</div>
                    </Tab>
                </Tabs>
            </div>
        </div>
    );
}
