"use client";
import { Spinner, Tab, Tabs } from "@heroui/react";
import { Fragment, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import MainLayout from "@/layouts/main-layout";
import { PostModalButton, PostItem, PostSkeletons } from "@/components/post";

import { useAuthStore } from "@/hooks/store";
import { usePagination, useVisibility } from "@/hooks";
import { IPost, ISelectMediaFile } from "@/types/post";
import { ErrorMessage } from "@/components";
import { useTranslation } from "react-i18next";
import { TranslationNameSpace } from "@/types/translation";
import { FullScreenMediaSlider } from "@/components/media";

function Home() {
    const [postType, setPostType] = useState<"feed" | "following" | "liked">("feed");
    const { currentUser } = useAuthStore();
    const { t: tPost } = useTranslation<TranslationNameSpace>("post");
    const { isVisible, show: showFullscreenSlider, hide: hideFullscreenSlider } = useVisibility();

    const [mediaInfo, setMediaInfo] = useState<ISelectMediaFile>({
        mediaFiles: [],
        index: 0,
    });

    const getURL = () => {
        switch (postType) {
            case "following":
                return `/post/following?userId=${currentUser?._id}`;
            case "liked":
                return `/post/liked?userId=${currentUser?._id}`;
            default:
                return "/post";
        }
    };

    const {
        data: posts,
        loadingMore,
        error,
        isReachedEnd,
        size,
        isLoading,
        setSize: setPage,
        mutate,
    } = usePagination<IPost>(getURL());

    return (
        <MainLayout>
            <FullScreenMediaSlider
                onHide={hideFullscreenSlider}
                isOpen={isVisible}
                activeSlideIndex={mediaInfo?.index ?? 0}
                mediaFiles={mediaInfo?.mediaFiles ?? []}
            />
            <div className="flex justify-center w-full">
                <div className="w-[calc(100vw_-_80px)] md:w-[630px]">
                    <header className="sticky top-0 z-10 p-4 flex justify-between items-center bg-background">
                        <Tabs
                            onSelectionChange={(key) => setPostType(key.toString() as typeof postType)}
                            color="default"
                            aria-label="Tabs colors"
                            radius="md"
                        >
                            <Tab key="feed" title={tPost("POST_FEED")} />
                            <Tab key="following" title={tPost("POST_FOLLOWING")} />
                            <Tab key="liked" title={tPost("POST_LIKED")} />
                        </Tabs>

                        <PostModalButton />
                    </header>

                    <main className="px-4 pb-4">
                        {error && !isLoading && <ErrorMessage error={error} className="text-center" />}
                        {posts.length === 0 && !isLoading && !error && <p className="text-center">Post not found</p>}
                        {!error && posts.length > 0 && (
                            <InfiniteScroll
                                next={() => setPage(size + 1)}
                                hasMore={!isReachedEnd}
                                loader={
                                    <div className="flex justify-center items-center overflow-hidden h-[70px]">
                                        <Spinner size="md" />
                                    </div>
                                }
                                dataLength={posts?.length ?? 0}
                            >
                                {posts.map((post) => (
                                    <Fragment key={post?._id}>
                                        <PostItem
                                            post={post}
                                            onSelectMediaFile={(mediaInfo) => {
                                                setMediaInfo(mediaInfo);
                                                showFullscreenSlider();
                                            }}
                                        />
                                    </Fragment>
                                ))}
                            </InfiniteScroll>
                        )}

                        {isLoading && <PostSkeletons length={2} />}
                    </main>
                </div>
            </div>
        </MainLayout>
    );
}

export default Home;
