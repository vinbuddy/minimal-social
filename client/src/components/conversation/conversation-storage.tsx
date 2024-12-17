"use client";

import InfiniteScroll from "react-infinite-scroll-component";
import { Spinner, Tab, Tabs } from "@nextui-org/react";
import Image from "next/image";

import { usePagination } from "@/hooks";
import { IMediaFile } from "@/types/post";

interface IProps {
    conversationId: string;
}

export default function ConversationStorage({ conversationId }: IProps) {
    const {
        data: mediaFiles,
        loadingMore,
        error,
        isReachedEnd,
        size,
        isLoading,
        setSize: setPage,
        mutate,
    } = usePagination<IMediaFile>(`/conversation/storage/media-file?conversationId=${conversationId}`);

    const renderMediaFiles = () => {
        if (error && !isLoading) {
            return <p className="text-center text-danger">{error?.message}</p>;
        }

        if (mediaFiles.length === 0 && !isLoading && !error) {
            return <p className="text-center">No media files yet</p>;
        }

        return (
            <>
                <div className="grid grid-cols-3 gap-2 ">
                    {mediaFiles.length > 0 && (
                        <InfiniteScroll
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
                            {mediaFiles.map((mediaFile) => (
                                <div className="mb-2 last:mb-0" key={mediaFile.publicId}>
                                    <Image
                                        className="rounded-lg"
                                        width={mediaFile.width}
                                        height={mediaFile.height}
                                        src={mediaFile.url}
                                        alt="media"
                                    />
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
            <div>
                <Tabs className="sticky top-[76px] bg-content1 pb-4" fullWidth size="md">
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
