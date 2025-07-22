"use client";
import { Alert, Avatar, Button, Spinner, Tab, Tabs } from "@heroui/react";
import { useParams, useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import useSWR from "swr";

import PostItem from "@/components/post/post-item";
import PostSkeletons from "@/components/post/post-skeletons";
import EditProfileModalButton from "@/components/user/edit-profile-modal-button";
import FollowButton from "@/components/user/follow-button";
import UserFollowInfoModal from "@/components/user/user-follow-info-modal";
import UserName from "@/components/user/user-name";
import { useAuthStore } from "@/hooks/store";
import { useIsBlocked, useIsOwner, useLoading, usePagination, useVisibility } from "@/hooks";
import { IPost, ISelectMediaFile } from "@/types/post";
import { IUser } from "@/types/user";
import { EllipsisIcon, SendIcon } from "lucide-react";
import axiosInstance from "@/utils/http-request";
import { showToast } from "@/utils/toast";
import ProfileMenuDropdown from "@/components/user/profile-menu-dropdown";
import ErrorMessage from "@/components/error-message";
import ScreenCenterWrapper from "@/components/screen-center-wrapper";
import PostModalButton from "@/components/post/post-modal-button";
import { useTranslation } from "react-i18next";
import FullScreenMediaSlider from "@/components/media/fullscreen-media-slider";

export default function ProfilePage() {
    const params = useParams() as { id: string };
    const router = useRouter();
    const { currentUser } = useAuthStore();
    const [postType, setPostType] = useState<"post" | "repost" | "liked">("post");

    const { data: user, isLoading, error } = useSWR<{ data: IUser }>(`/user/${params.id}`);
    const [followerCount, setFollowerCount] = useState(user?.data?.followers?.length ?? 0);
    const { loading, startLoading, stopLoading } = useLoading();
    const { isVisible, show: showFullscreenSlider, hide: hideFullscreenSlider } = useVisibility();

    const isOwner = useIsOwner(user?.data?._id);

    const isBlocked = useIsBlocked(user?.data?._id);
    const [mediaInfo, setMediaInfo] = useState<ISelectMediaFile>({
        mediaFiles: [],
        index: 0,
    });

    const { t: tUser } = useTranslation("user");
    const { t: tPost } = useTranslation("post");

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

    if (isLoading) {
        return (
            <ScreenCenterWrapper>
                <Spinner size="lg" />
            </ScreenCenterWrapper>
        );
    }

    if (error) {
        return (
            <ScreenCenterWrapper>
                <ErrorMessage error={error} />
            </ScreenCenterWrapper>
        );
    }

    if (!user?.data) {
        return (
            <ScreenCenterWrapper>
                <Alert color="danger" title="User not found" />
            </ScreenCenterWrapper>
        );
    }

    return (
        <div className="flex justify-center w-full">
            <FullScreenMediaSlider
                onHide={hideFullscreenSlider}
                isOpen={isVisible}
                activeSlideIndex={mediaInfo?.index ?? 0}
                mediaFiles={mediaInfo?.mediaFiles ?? []}
            />
            <div className="w-[calc(100vw_-_80px)] md:w-[630px]">
                <main className="px-4 py-5">
                    <section className="flex flex-wrap justify-center items-center gap-10">
                        <Avatar
                            classNames={{
                                base: "h-36 w-36",
                            }}
                            isBordered
                            color="default"
                            size="lg"
                            showFallback={false}
                            src={
                                user?.data.photo ??
                                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTIlcun59hjzIIjphLcoczCdFuaSyOpwDpFyHtp1R9WTq-MfqlfCtP4jTjJf94buMJfHw&usqp=CAU"
                            }
                        />

                        <div className="flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <UserName className="text-2xl justify-center" user={user?.data} />

                                <div className="flex items-center gap-2">
                                    {isOwner && (
                                        <EditProfileModalButton variant="flat">
                                            {tUser("USER.EDIT_PROFILE")}
                                        </EditProfileModalButton>
                                    )}

                                    <ProfileMenuDropdown user={user?.data}>
                                        <Button isIconOnly variant="light">
                                            <EllipsisIcon size={16} />
                                        </Button>
                                    </ProfileMenuDropdown>
                                </div>
                            </div>

                            {!isBlocked && (
                                <>
                                    <div className="flex gap-4 my-4">
                                        <UserFollowInfoModal type="follower" user={user?.data}>
                                            <p>
                                                {followerCount}{" "}
                                                <span className="text-default-500">{tUser("USER.FOLLOWER")}</span>
                                            </p>
                                        </UserFollowInfoModal>
                                        <UserFollowInfoModal type="following" user={user?.data}>
                                            <p>
                                                {user?.data?.followings.length}{" "}
                                                <span className="text-default-500">{tUser("USER.FOLLOWING")}</span>
                                            </p>
                                        </UserFollowInfoModal>
                                    </div>

                                    <p className="text-default-500">{user?.data?.bio}</p>
                                </>
                            )}
                        </div>
                    </section>

                    {isOwner && (
                        <section className="mt-10">
                            <PostModalButton fullWidth isResponsive={false} />
                        </section>
                    )}

                    {!isOwner && !isBlocked && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                            <FollowButton
                                size="md"
                                radius="md"
                                fullWidth={true}
                                user={user?.data}
                                onAfterFollowed={() => setFollowerCount((prev) => prev + 1)}
                                onAfterUnFollowed={() => setFollowerCount((prev) => prev - 1)}
                            />
                            <Button
                                variant="flat"
                                isLoading={loading}
                                startContent={<SendIcon size={16} />}
                                fullWidth={true}
                                onPress={handleNavigateToConversation}
                            >
                                {tUser("USER.SEND_MESSAGE")}
                            </Button>
                        </div>
                    )}

                    {/* Posts */}
                    {isBlocked ? (
                        <div className="mt-5">
                            <Alert color="warning" title="You blocked this user, you can not see their posts" />
                        </div>
                    ) : (
                        <section className="mt-5">
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
                                <Tab key="post" title={tPost("POST_FEED")} />
                                <Tab key="liked" title={tPost("POST_LIKED")} />
                                <Tab key="repost" title={tPost("POST_REPOSTED")} />
                            </Tabs>

                            <div className="mt-5">
                                {postError && !isPostLoading && (
                                    <ErrorMessage className="text-danger" error={postError} />
                                )}
                                {posts.length === 0 && !isPostLoading && !postError && (
                                    <p className="text-center">{tPost("POST_EMPTY")}</p>
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

                                {isPostLoading && <PostSkeletons length={3} />}
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
}
