"use client";
import MainLayout from "@/components/MainLayout";
import PostItem from "@/components/Post/PostItem";
import PostSkeletons from "@/components/Post/PostSkeletons";
import EditProfileModalButton from "@/components/User/EditProfileModalButton";
import FollowButton from "@/components/User/FollowButton";
import UserFollowInfoModal from "@/components/User/UserFollowInfoModal";
import UserName from "@/components/User/UserName";
import useAuthStore from "@/hooks/store/useAuthStore";
import usePagination from "@/hooks/usePagination";
import { IPost } from "@/types/post";
import { IUser } from "@/types/user";
import { Avatar, Button, Card, Spinner, Tab, Tabs } from "@nextui-org/react";
import { useParams } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import useSWR from "swr";

export default function ProfilePage() {
    const params = useParams() as { id: string };
    const { currentUser } = useAuthStore();
    const [postType, setPostType] = useState<"post" | "repost" | "liked">("post");

    const { data: user, isLoading, error } = useSWR<{ data: IUser }>(`/user/${params.id}`);
    const [followerCount, setFollowerCount] = useState(user?.data?.followers?.length ?? 0);

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

    return (
        <MainLayout>
            <div className="flex justify-center w-full">
                <div className="w-[630px]">
                    <main className="px-4 py-5">
                        <section className="flex items-center gap-10">
                            <Avatar
                                isBordered
                                src={user?.data?.photo}
                                size="lg"
                                classNames={{
                                    base: "!size-36 !ring-offset-4",
                                }}
                            />

                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <UserName className="text-2xl justify-center" user={user?.data} />
                                    {user && user?.data?._id !== currentUser?._id ? (
                                        <FollowButton
                                            buttonProps={{ size: "md", radius: "md", fullWidth: false }}
                                            user={user?.data}
                                            onAfterFollowed={() => setFollowerCount((prev) => prev + 1)}
                                            onAfterUnFollowed={() => setFollowerCount((prev) => prev - 1)}
                                        />
                                    ) : (
                                        // <Button variant="flat">Edit profile</Button>
                                        <EditProfileModalButton
                                            buttonProps={{
                                                variant: "flat",
                                                children: "Edit profile",
                                            }}
                                        />
                                    )}
                                </div>

                                <div className="flex gap-4 my-2">
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
                                    <p className="text-center text-danger">{postError?.message}</p>
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
                </div>
            </div>
        </MainLayout>
    );
}
