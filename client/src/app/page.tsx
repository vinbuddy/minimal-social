"use client";
import { Spinner, Tab, Tabs } from "@nextui-org/react";
import { ImageIcon, PanelRight, PaperclipIcon, Phone, PlusIcon, Search, ThumbsUpIcon, Video } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import MainLayout from "@/components/MainLayout";
import PostModalButton from "@/components/Post/PostModalButton";
import useAuthStore from "@/hooks/store/useAuthStore";
import usePagination from "@/hooks/usePagination";
import { IPost } from "@/types/post";
import PostItem from "@/components/Post/PostItem";
function Home() {
    const [postType, setPostType] = useState<"feed" | "following" | "liked">("feed");
    const {
        data: posts,
        loadingMore,
        error,
        isReachedEnd,
        size,
        setSize: setPage,
        mutate,
    } = usePagination<IPost>("/post");

    console.log(posts);

    return (
        <MainLayout>
            <div className="flex justify-center w-full">
                <div className="min-w-[630px]">
                    <header className="sticky top-0 z-10 p-4 flex justify-between items-center bg-background">
                        <Tabs
                            onSelectionChange={(key) => setPostType(key.toString() as typeof postType)}
                            color="default"
                            aria-label="Tabs colors"
                            radius="md"
                        >
                            <Tab key="feed" title="Feed" />
                            <Tab key="following" title="Following" />
                            <Tab key="liked" title="Liked" />
                        </Tabs>

                        <PostModalButton />
                    </header>

                    <main className="px-4 pb-4">
                        <InfiniteScroll
                            next={() => setPage(size + 1)}
                            hasMore={!isReachedEnd}
                            loader={
                                <div className="flex justify-center">
                                    <Spinner size="sm" />
                                </div>
                            }
                            dataLength={posts?.length ?? 0}
                        >
                            {posts.map((post) => (
                                <Fragment key={post?._id}>
                                    <PostItem post={post} />
                                </Fragment>
                            ))}
                        </InfiniteScroll>
                    </main>
                </div>
            </div>
        </MainLayout>
    );
}

export default Home;
