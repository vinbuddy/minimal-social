"use client";
import { Avatar, Button, Spinner, Tab, Tabs, Tooltip } from "@nextui-org/react";
import { useParams, useRouter } from "next/navigation";
import { Fragment, useEffect, useMemo, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import useSWR from "swr";

import MainLayout from "@/components/main-layout";
import PostItem from "@/components/post/post-item";
import PostSkeletons from "@/components/post/post-skeletons";
import EditProfileModalButton from "@/components/user/edit-profile-modal-button";
import FollowButton from "@/components/user/follow-button";
import UserFollowInfoModal from "@/components/user/user-follow-info-modal";
import UserName from "@/components/user/user-name";
import { useAuthStore } from "@/hooks/store";
import { useIsOwner, useLoading, usePagination } from "@/hooks";
import { IPost } from "@/types/post";
import { IUser } from "@/types/user";
import { EllipsisIcon, SendIcon } from "lucide-react";
import axiosInstance from "@/utils/http-request";
import { showToast } from "@/utils/toast";
import ProfileMenuDropdown from "@/components/user/profile-menu-dropdown";
import ErrorMessage from "@/components/error-message";

export default function ProfilePage() {
    const params = useParams() as { id: string };
    const router = useRouter();
    const { currentUser } = useAuthStore();
    const [postType, setPostType] = useState<"post" | "repost" | "liked">("post");

    const { data: user, isLoading, error } = useSWR<{ data: IUser }>(`/user/${params.id}`);
    const [followerCount, setFollowerCount] = useState(user?.data?.followers?.length ?? 0);
    const { loading, startLoading, stopLoading } = useLoading();
    const isOwner = useIsOwner(user?.data?._id);

    const isBlocked = useMemo(() => {
        return currentUser?.blockedUsers.some((blockedUser) => blockedUser._id === user?.data._id);
    }, [currentUser, user]);

    useEffect(() => {
        if (user) {
            setFollowerCount(user.data.followers.length);
        }
    }, [user]);

    const getURL = () => {
        switch (postType) {
            case "repost":
                return `/post/user-post?userId=${params?.id}&type=repost`;
            case "liked":
                return `/post/liked?userId=${params?.id}`;
            default:
                return `/post/user-post?userId=${params.id}&type=post`;
        }
    };

    const {
        data: posts,
        loadingMore,
        isReachedEnd,
        size,
        isLoading: isPostLoading,
        error: postError,
        setSize: setPage,
        mutate,
    } = usePagination<IPost>(getURL());

    const handleNavigateToConversation = async () => {
        try {
            if (!currentUser || !user?.data._id) return;

            startLoading();

            const res = await axiosInstance.post("/conversation", {
                participants: [currentUser._id, user?.data._id],
            });

            const conversationId = res.data.data._id;

            router.push(`/conversation/${conversationId}`);
        } catch (error: any) {
            showToast(error?.response?.data?.message || "An error occurred", "error");
        } finally {
            stopLoading();
        }
    };

    return (
        <MainLayout>
            <div className="flex justify-center w-full">
                <div className="w-[calc(100vw_-_80px)] md:w-[630px]">
                    {error ? (
                        <ErrorMessage className="text-center" error={error} />
                    ) : (
                        <main className="px-4 py-5">
                            <section className="flex flex-wrap justify-center items-center gap-10">
                                <Avatar
                                    isBordered
                                    src={user?.data?.photo}
                                    size="lg"
                                    classNames={{
                                        base: "!size-36 !ring-offset-4",
                                    }}
                                />

                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <UserName className="text-2xl justify-center" user={user?.data} />

                                        <div className="flex items-center gap-2">
                                            {user && !isOwner && !isBlocked && (
                                                <>
                                                    <FollowButton
                                                        buttonProps={{ size: "md", radius: "md", fullWidth: false }}
                                                        user={user?.data}
                                                        onAfterFollowed={() => setFollowerCount((prev) => prev + 1)}
                                                        onAfterUnFollowed={() => setFollowerCount((prev) => prev - 1)}
                                                    />
                                                    <Tooltip content="Send message" placement="bottom" closeDelay={0}>
                                                        <Button
                                                            isIconOnly
                                                            variant="light"
                                                            isLoading={loading}
                                                            onClick={handleNavigateToConversation}
                                                        >
                                                            <SendIcon size={16} />
                                                        </Button>
                                                    </Tooltip>
                                                </>
                                            )}
                                            {user && isOwner && (
                                                <EditProfileModalButton
                                                    buttonProps={{
                                                        variant: "flat",
                                                        children: "Edit profile",
                                                    }}
                                                />
                                            )}

                                            {user && (
                                                <ProfileMenuDropdown user={user?.data}>
                                                    <Button isIconOnly variant="light">
                                                        <EllipsisIcon size={16} />
                                                    </Button>
                                                </ProfileMenuDropdown>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-4 my-4">
                                        <UserFollowInfoModal type="follower" user={user?.data}>
                                            <p>
                                                {followerCount} <span className="text-default-500">followers</span>
                                            </p>
                                        </UserFollowInfoModal>
                                        <UserFollowInfoModal type="following" user={user?.data}>
                                            <p>
                                                {user?.data?.followings.length}{" "}
                                                <span className="text-default-500">following</span>
                                            </p>
                                        </UserFollowInfoModal>
                                    </div>

                                    <p className="text-default-500">{user?.data?.bio}</p>
                                </div>
                            </section>
                            <section className="mt-10">
                                <Tabs
                                    onSelectionChange={(key) => setPostType(key.toString() as typeof postType)}
                                    variant="underlined"
                                    color="default"
                                    fullWidth
                                    size="lg"
                                    classNames={{
                                        tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                                        cursor: "w-full bg-primary",
                                        tab: "h-12",
                                    }}
                                >
                                    <Tab key="post" title="Posts" />
                                    <Tab key="liked" title="Liked post" />
                                    <Tab key="repost" title="Reposts" />
                                </Tabs>

                                <div className="mt-5">
                                    {postError && !isPostLoading && (
                                        <ErrorMessage className="text-danger" error={postError} />
                                    )}
                                    {posts.length === 0 && !isPostLoading && !postError && (
                                        <p className="text-center">No post yet</p>
                                    )}
                                    {!postError && posts.length > 0 && (
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
                                                    <PostItem post={post} />
                                                </Fragment>
                                            ))}
                                        </InfiniteScroll>
                                    )}

                                    {isPostLoading && <PostSkeletons length={3} />}
                                </div>
                            </section>
                        </main>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
