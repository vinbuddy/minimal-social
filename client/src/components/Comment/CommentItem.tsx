"use client";
import { HeartIcon } from "@/assets/icons";
import { IComment } from "@/types/comment";
import { Avatar, Button, Tooltip } from "@nextui-org/react";
import parse, { domToReact, HTMLReactParserOptions } from "html-react-parser";
import { ChevronDownIcon, EllipsisIcon, LoaderIcon } from "lucide-react";
import Link from "next/link";
import UserName from "../User/UserName";
import TimeAgo from "../TimeAgo";
import UserProfileCard from "../User/UserProfileCard";
import { useState } from "react";
import useAuthStore from "@/hooks/store/useAuthStore";
import { toast } from "sonner";
import usePagination from "@/hooks/usePagination";
import useCommentStore from "@/hooks/store/useCommentStore";
import axiosInstance from "@/utils/httpRequest";

interface IProps {
    comment: IComment;
    isReply?: boolean;
}

export default function CommentItem({ comment, isReply = false }: IProps) {
    const { currentUser } = useAuthStore();
    const { reply } = useCommentStore();

    const [isLiked, setIsLiked] = useState<boolean>(() => comment?.likes.includes(currentUser?._id) || false);
    const [likeCount, setLikeCount] = useState<number>(comment?.likeCount ?? 0);

    const [isOpenReply, setIsOpenReply] = useState<boolean>(false);

    const {
        data: replies,
        isLoading,
        loadingMore,
        error,
        isReachedEnd,
        size: page,
        setSize: setPage,
        mutate,
    } = usePagination<IComment>(isOpenReply ? `/comment/reply?rootComment=${comment?._id}` : null);

    const parserOptions: HTMLReactParserOptions = {
        replace({ attribs, children }: any) {
            if (!attribs) {
                return;
            }

            if (attribs.class === "text-link") {
                return (
                    <Link href={attribs.href} className="text-link">
                        {domToReact(children, parserOptions)}
                    </Link>
                );
            }
        },
    };

    const handleUnLike = async (): Promise<void> => {
        if (!currentUser?._id || !comment?._id) return;
        setIsLiked(false);
        setLikeCount((prev) => prev - 1);

        try {
            const response = await axiosInstance.put("/comment/unlike", {
                commentId: comment?._id,
                userId: currentUser?._id,
            });

            toast.success("Unliked post successfully", {
                position: "bottom-center",
            });
        } catch (error: any) {
            setIsLiked(true);
            setLikeCount((prev) => prev + 1);
            toast.error("Failed to unlike post", {
                position: "bottom-center",
            });
            console.log(error.response.data.message);
        }
    };

    const handleLike = async (): Promise<void> => {
        if (!currentUser?._id || !comment?._id) return;
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);

        try {
            const response = await axiosInstance.put("/comment/like", {
                commentId: comment._id,
                userId: currentUser?._id,
            });

            toast.success("Liked post successfully", {
                position: "bottom-center",
            });
        } catch (error: any) {
            setIsLiked(false);
            setLikeCount((prev) => prev - 1);

            toast.error("Failed to like post", {
                position: "bottom-center",
            });
            console.log(error.response.data.message);
        }
    };

    const handleLoadReplies = () => {
        setPage(page + 1);
        setIsOpenReply(true);
    };

    return (
        <div className="mb-5 last:mb-0">
            <div className="flex group ">
                <section>
                    <Avatar src={comment?.commentBy?.photo} size={isReply ? "sm" : "md"} />
                </section>
                <section className="ms-4 flex flex-1 max-w-full overflow-hidden">
                    <section className="flex-1">
                        <div className="flex items-start justify-between">
                            <Tooltip
                                delay={500}
                                placement="bottom-start"
                                content={<UserProfileCard user={comment?.commentBy} />}
                            >
                                <h4 className="text-sm">
                                    <UserName user={comment?.commentBy} />
                                </h4>
                            </Tooltip>
                        </div>
                        <div className="text-default-600 text-[14px] mt-[0.5px]">
                            {parse(comment.content, parserOptions)}
                        </div>

                        <div className="flex items-center gap-1 text-[12px] mt-1 text-default-400">
                            <button className="pe-2">
                                <TimeAgo date={comment?.createdAt} />
                            </button>

                            <button onClick={() => reply(comment)} className="px-2 ">
                                Reply
                            </button>

                            <button className="px-2 group-hover:block hidden">
                                <EllipsisIcon size={18} />
                            </button>
                        </div>

                        {/*  REPLIES DIDN'T FETCH */}
                        {comment?.replyCount > 0 && replies.length == 0 && (
                            <div className="mt-1 flex">
                                <Button
                                    onPress={handleLoadReplies}
                                    className="px-0 bg-transparent text-default-400"
                                    size="sm"
                                    disableRipple
                                    endContent={
                                        isLoading ? (
                                            <LoaderIcon className="animate-spin" size={16} />
                                        ) : (
                                            <ChevronDownIcon size={16} />
                                        )
                                    }
                                >
                                    See {comment?.replyCount ?? 0} replies
                                </Button>
                            </div>
                        )}
                    </section>

                    <section>
                        <div className="flex items-center gap-3">
                            <Button
                                title="like"
                                onClick={isLiked ? handleUnLike : handleLike}
                                size="sm"
                                radius="full"
                                color={isLiked ? "danger" : "default"}
                                variant="light"
                                className="flex-col w-auto h-auto min-w-0 px-1.5 py-2"
                                startContent={<HeartIcon isFilled={isLiked} size={18} />}
                            >
                                {likeCount}
                            </Button>
                        </div>
                    </section>
                </section>
            </div>

            {/* REPLIES WRAPPER*/}
            {replies.length > 0 && (
                <div className="flex mt-5">
                    <div>
                        <Avatar className="invisible" src="" size="md" />
                    </div>

                    {/* COMMENT ITEMS */}
                    <div className="flex-1 ms-4">
                        {replies.map((reply) => (
                            <CommentItem key={reply._id} isReply={true} comment={reply} />
                        ))}

                        {/* IF REPLIES FETCHED */}
                        {!isReachedEnd && (
                            <div className="mt-1 flex">
                                <Button
                                    onPress={handleLoadReplies}
                                    className="px-0 bg-transparent text-default-400"
                                    size="sm"
                                    disableRipple
                                    endContent={
                                        isLoading ? (
                                            <LoaderIcon className="animate-spin" size={16} />
                                        ) : (
                                            <ChevronDownIcon size={16} />
                                        )
                                    }
                                >
                                    See {comment?.replyCount ?? 0} replies
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
