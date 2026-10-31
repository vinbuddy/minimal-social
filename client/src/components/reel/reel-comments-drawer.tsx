"use client";
import { Fragment } from "react";
import { Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Spinner } from "@heroui/react";
import InfiniteScroll from "react-infinite-scroll-component";
import useSWR from "swr";
import { useTranslation } from "react-i18next";

import { CommentForm, CommentItem } from "../comment";
import { useBreakpoint, usePagination } from "@/hooks";
import { IComment } from "@/types/comment";
import { IReel } from "@/types/reel";

export interface IFocusComment {
    commentId: string;
    // The top-level comment of the thread (the comment itself when it is not a reply)
    rootId: string;
}

interface IProps {
    reel: IReel;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onCommented?: () => void;
    focusComment?: IFocusComment;
}

export default function ReelCommentsDrawer({ reel, isOpen, onOpenChange, onCommented, focusComment }: IProps) {
    const breakpoint = useBreakpoint();
    const { t: tReel } = useTranslation("reel");
    const { t: tComment } = useTranslation("comment");
    const scrollTargetId = `reel-comments-${reel._id}`;

    // Comments load only once the drawer is open
    const {
        data: comments,
        isLoading,
        error,
        isReachedEnd,
        size,
        setSize: setPage,
    } = usePagination<IComment>(isOpen ? `/comment?targetType=Reel&target=${reel._id}` : null);

    // The linked thread may sit pages down the list, so it is fetched on its own and pinned on top
    const { data: focusResponse } = useSWR<{ data: IComment }>(
        isOpen && focusComment ? `/comment/${focusComment.rootId}` : null
    );
    const pinnedComment = focusResponse?.data?.target === reel._id ? focusResponse.data : null;
    const listedComments = pinnedComment ? comments.filter((comment) => comment._id !== pinnedComment._id) : comments;

    return (
        <Drawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            placement={breakpoint === "mobile" ? "bottom" : "right"}
            size={breakpoint === "mobile" ? "full" : "md"}
            backdrop="transparent"
            classNames={{ base: "sm:rounded-none sm:rounded-l-large" }}
        >
            <DrawerContent>
                {() => (
                    <>
                        <DrawerHeader className="justify-center border-b border-divider text-base font-semibold">
                            {tReel("REEL_COMMENTS")}
                        </DrawerHeader>
                        <DrawerBody id={scrollTargetId} className="scrollbar py-0">
                            {pinnedComment && (
                                <div className="pt-4 pb-1 mb-4 border-b border-divider">
                                    <CommentItem
                                        comment={pinnedComment}
                                        highlightId={focusComment?.commentId}
                                        defaultOpenReplies={focusComment?.commentId !== pinnedComment._id}
                                    />
                                </div>
                            )}
                            {isLoading && (
                                <div className="flex justify-center py-10">
                                    <Spinner />
                                </div>
                            )}
                            {error && !isLoading && <p className="text-center text-danger py-10">{error?.message}</p>}
                            {comments.length === 0 && !pinnedComment && !isLoading && !error && (
                                <p className="text-center text-default-500 py-10">{tComment("COMMENT_EMPTY")}</p>
                            )}
                            {listedComments.length > 0 && (
                                <InfiniteScroll
                                    scrollableTarget={scrollTargetId}
                                    next={() => setPage(size + 1)}
                                    hasMore={!isReachedEnd}
                                    loader={
                                        <div className="flex justify-center items-center overflow-hidden h-[70px]">
                                            <Spinner size="md" />
                                        </div>
                                    }
                                    dataLength={comments.length}
                                >
                                    {listedComments.map((comment) => (
                                        <Fragment key={comment._id}>
                                            <CommentItem comment={comment} />
                                        </Fragment>
                                    ))}
                                </InfiniteScroll>
                            )}
                        </DrawerBody>
                        <DrawerFooter className="block border-t border-divider">
                            <CommentForm target={reel} targetType="Reel" onCommented={onCommented} />
                        </DrawerFooter>
                    </>
                )}
            </DrawerContent>
        </Drawer>
    );
}
