"use client";

import { HeartIcon, RepostIcon } from "@/assets/icons";
import {
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    useDisclosure,
    Image,
    ButtonProps,
    ModalFooter,
    Tabs,
    Tab,
    Chip,
    Spinner,
} from "@heroui/react";
import { TRANSITION_EASINGS } from "@heroui/framer-utils";
import InfiniteScroll from "react-infinite-scroll-component";
import { Fragment, useState } from "react";

import UserItem from "../user/user-item";
import UserSkeletons from "../user/user-skeletons";

import { IPost } from "@/types/post";
import { IUser } from "@/types/user";
import { usePagination } from "@/hooks";
import ErrorMessage from "../error-message";

interface IProps extends ButtonProps {
    post: IPost;
}

export default function PostActivitiesModalButton({ post, ...rest }: IProps) {
    const [activity, setActivity] = useState<"like" | "repost">("like");
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

    const getURL = () => {
        switch (activity) {
            case "like":
                return `/post/user-liked/${post._id}`;
            default:
                return `/post/user-reposted/${post._id}`;
        }
    };

    const {
        data: users,
        loadingMore,
        error,
        isReachedEnd,
        size,
        isLoading,
        setSize: setPage,
        mutate,
    } = usePagination<IUser>(getURL());

    return (
        <>
            <Button onPress={onOpen}>{rest.children}</Button>

            <Modal
                size="lg"
                scrollBehavior="inside"
                hideCloseButton
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                motionProps={{
                    variants: {
                        enter: {
                            scale: 1,
                            y: "var(--slide-enter)",
                            opacity: 1,
                            transition: {
                                scale: {
                                    duration: 0.4,
                                    ease: TRANSITION_EASINGS.ease,
                                },
                                opacity: {
                                    duration: 0.4,
                                    ease: TRANSITION_EASINGS.ease,
                                },
                                y: {
                                    type: "spring",
                                    bounce: 0,
                                    duration: 0.6,
                                },
                            },
                        },
                        exit: {
                            scale: 1.1, // NextUI default 1.03
                            y: "var(--slide-exit)",
                            opacity: 0,
                            transition: {
                                duration: 0.3,
                                ease: TRANSITION_EASINGS.ease,
                            },
                        },
                    },
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex items-center justify-between">
                                Post Activities
                                <Tabs
                                    onSelectionChange={(key) => setActivity(key.toString() as typeof activity)}
                                    size="sm"
                                    // variant="solid"
                                >
                                    <Tab
                                        key="like"
                                        title={
                                            <div className="flex items-center space-x-2">
                                                <HeartIcon size={18} />
                                                <span>Likes</span>
                                                <Chip size="sm" variant="faded">
                                                    {post.likeCount ?? 0}
                                                </Chip>
                                            </div>
                                        }
                                    />
                                    <Tab
                                        key="repost"
                                        title={
                                            <div className="flex items-center space-x-2">
                                                <RepostIcon size={18} />
                                                <span>Repost</span>
                                                <Chip size="sm" variant="faded">
                                                    {post?.repostCount ?? 0}
                                                </Chip>
                                            </div>
                                        }
                                    />
                                </Tabs>
                            </ModalHeader>
                            <ModalBody id="post-activity" className="py-0 px-6 scrollbar">
                                <div>
                                    {error && !isLoading && <ErrorMessage error={error} className="text-center" />}
                                    {users.length === 0 && !isLoading && !error && (
                                        <p className="text-center">This post has not activated yet</p>
                                    )}
                                    {!error && users.length > 0 && (
                                        <InfiniteScroll
                                            scrollableTarget="post-activity"
                                            next={() => setPage(size + 1)}
                                            hasMore={!isReachedEnd}
                                            loader={
                                                <div className="flex justify-center items-center overflow-hidden h-[70px]">
                                                    <Spinner size="md" />
                                                </div>
                                            }
                                            dataLength={users?.length ?? 0}
                                        >
                                            {users.map((user) => (
                                                <UserItem key={user?._id} user={user} />
                                            ))}
                                        </InfiniteScroll>
                                    )}
                                    {isLoading && <UserSkeletons length={3} />}
                                </div>
                            </ModalBody>
                            <ModalFooter></ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
