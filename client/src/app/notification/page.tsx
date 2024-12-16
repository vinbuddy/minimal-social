"use client";
import { Spinner, Tab, Tabs } from "@nextui-org/react";
import { AtSignIcon, UserIcon } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import { CommentIcon, HeartIcon, RepostIcon } from "@/assets/icons";
import MainLayout from "@/components/MainLayout";
import NotificationItem from "@/components/Notification/NotificationItem";
import NotificationSkeletons from "@/components/Notification/NotificationSkeletons";

import { useAuthStore } from "@/hooks/store";
import { usePagination } from "@/hooks";
import { INotification } from "@/types/notification";
import { IUser } from "@/types/user";
import axiosInstance from "@/utils/httpRequest";

type NotificationActionType = "all" | "like" | "follow" | "comment" | "mention" | "repost";

export default function NotificationPage() {
    const [action, setAction] = useState<NotificationActionType>("all");
    const { currentUser } = useAuthStore();
    const [isReadAll, setIsReadAll] = useState(false);

    const {
        data: notifications,
        loadingMore,
        error,
        isReachedEnd,
        size,
        isLoading,
        setSize: setPage,
        mutate,
    } = usePagination<INotification>(currentUser ? `/notification/${currentUser?._id}?action=${action}` : null);

    const showNoResults = !isLoading && !error && notifications?.length === 0 && currentUser;

    useEffect(() => {
        const markAllAsRead = async () => {
            try {
                await axiosInstance.post(`/notification/read-all/${currentUser?._id}`);

                useAuthStore.setState((state) => ({
                    currentUser: {
                        ...(state.currentUser as IUser),
                        isNotification: false,
                    },
                }));

                setIsReadAll(true);
            } catch (error) {
                console.error("Failed to mark notifications as read:", error);
            }
        };

        if (notifications?.length > 0 && currentUser && !isReadAll) {
            markAllAsRead();
        }
    }, [notifications, currentUser, isReadAll]);

    return (
        <MainLayout>
            <div className="flex justify-center w-full">
                <div className="w-screen md:w-[630px]">
                    <header className="sticky top-0 z-10 p-4 flex justify-center items-center bg-background">
                        <Tabs
                            onSelectionChange={(key) => setAction(key.toString() as NotificationActionType)}
                            variant="light"
                            color="default"
                            radius="full"
                            fullWidth
                        >
                            <Tab key="all" title="All" />
                            <Tab
                                key="like"
                                title={
                                    <div className="flex items-center gap-2">
                                        <HeartIcon size={18} />
                                        <span>Like</span>
                                    </div>
                                }
                            />
                            <Tab
                                key="follow"
                                title={
                                    <div className="flex items-center gap-2">
                                        <UserIcon size={18} />
                                        <span>Follow</span>
                                    </div>
                                }
                            />
                            <Tab
                                key="comment"
                                title={
                                    <div className="flex items-center gap-2">
                                        <CommentIcon size={18} />
                                        <span>Comment</span>
                                    </div>
                                }
                            />
                            <Tab
                                key="mention"
                                title={
                                    <div className="flex items-center gap-2">
                                        <AtSignIcon size={18} />
                                        <span>Mention</span>
                                    </div>
                                }
                            />
                            <Tab
                                key="repost"
                                title={
                                    <div className="flex items-center gap-2">
                                        <RepostIcon size={18} />
                                        <span>Repost</span>
                                    </div>
                                }
                            />
                        </Tabs>
                    </header>

                    <main className="px-4 pb-4">
                        {error && !isLoading && <p className="text-center text-danger">{error?.message}</p>}
                        {showNoResults && <p className="text-center">No notifications yet</p>}
                        {!error && notifications.length > 0 && (
                            <InfiniteScroll
                                next={() => setPage(size + 1)}
                                hasMore={!isReachedEnd}
                                loader={
                                    <div className="flex justify-center items-center overflow-hidden h-[70px]">
                                        <Spinner size="md" />
                                    </div>
                                }
                                dataLength={notifications?.length ?? 0}
                            >
                                {notifications.map((notification) => (
                                    <Fragment key={notification?._id}>
                                        <NotificationItem notification={notification} />
                                    </Fragment>
                                ))}
                            </InfiniteScroll>
                        )}
                        {isLoading && <NotificationSkeletons length={5} />}
                    </main>
                </div>
            </div>
        </MainLayout>
    );
}
