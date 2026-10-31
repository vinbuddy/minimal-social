"use client";
import { Avatar, Button, Spinner } from "@heroui/react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { RedoIcon, SendHorizontalIcon, SmileIcon, XIcon } from "lucide-react";
import parse, { domToReact, HTMLReactParserOptions } from "html-react-parser";

import { RichTextEditor } from "@/components";
import EmojiPicker from "../emoji-picker";
import axiosInstance from "@/utils/http-request";
import { useAuthStore, useReplyStore } from "@/hooks/store";
import { useGlobalMutation, useLoading } from "@/hooks";
import { showToast } from "@/utils/toast";
import { IComment } from "@/types/comment";
import { IPost } from "@/types/post";
import { IReel } from "@/types/reel";
import { useTranslation } from "react-i18next";

type CommentTargetType = IPost | IReel;

interface IProps<T extends CommentTargetType, TT> {
    target: T;
    targetType: TT;
    onCommented?: (comment: IComment) => void;
}

export default function CommentForm<T extends CommentTargetType, TT extends "Post" | "Reel">({
    targetType,
    target,
    onCommented,
}: IProps<T, TT>) {
    const params: { id: string } = useParams();
    const { currentUser } = useAuthStore();
    const { startLoading, stopLoading, loading } = useLoading();
    const mutate = useGlobalMutation();
    const { replyTo, unReply } = useReplyStore();

    const { t: tComment } = useTranslation("comment");

    const [comment, setComment] = useState<string>("");
    const commentInputRef = useRef<HTMLDivElement>(null);

    const parserOptions: HTMLReactParserOptions = {
        replace({ attribs, children }: any) {
            if (!attribs) {
                return;
            }

            if (attribs.class === "text-link") {
                return <a className="text-link cursor-default">{domToReact(children, parserOptions)}</a>;
            }
        },
    };

    // Reels open their comments in a drawer, so the target comes from props rather than the route
    const isReel = targetType === "Reel";
    const targetId = target?._id ?? params.id;
    const targetOwnerId = isReel ? (target as IReel)?.reelBy?._id : (target as IPost)?.postBy?._id;
    const targetUrl = isReel ? `/reels/${targetId}` : `/post/${targetId}`;

    const handleSubmit = async () => {
        if (!comment.trim()) return;

        try {
            startLoading();

            const data = {
                commentBy: currentUser?._id,
                content: comment,
                target: targetId,
                targetType: targetType,
                replyTo: replyTo?._id ?? undefined,
                rootComment: replyTo?.rootComment === null ? replyTo?._id : replyTo?.rootComment,
            };
            const response = await axiosInstance.post("/comment", data);
            const commentResponse = response.data.data as IComment;

            // Notification reply
            if (!replyTo) {
                await axiosInstance.post("/notification", {
                    target: commentResponse?._id,
                    targetType: "Comment",
                    action: "comment",
                    photo: currentUser?.photo,
                    message: tComment(
                        isReel ? "COMMENT_MESSAGE.COMMENTED_ON_YOUR_REEL" : "COMMENT_MESSAGE.COMMENTED_ON_YOUR_POST"
                    ),
                    sender: currentUser?._id,
                    receivers: [targetOwnerId],
                    url: `${targetUrl}?commentId=${commentResponse?._id}`,
                });
            } else {
                await axiosInstance.post("/notification", {
                    target: commentResponse?._id,
                    targetType: "Comment",
                    action: "comment",
                    photo: currentUser?.photo,
                    message: tComment("COMMENT_MESSAGE.REPLIED_TO_YOUR_COMMENT"),
                    sender: currentUser?._id,
                    receivers: [replyTo?.commentBy?._id],
                    url: `${targetUrl}?commentId=${commentResponse?._id}&rootComment=${
                        replyTo?.rootComment ?? replyTo?._id
                    }&replyToId=${replyTo?._id}`,
                });
            }

            // Notification comment

            if (commentInputRef.current) {
                commentInputRef.current.innerHTML = "";
                setComment("");
                unReply();
            }

            // Revalidating the reel feed would re-rank it under the viewer, so reels update their count locally
            if (!isReel) mutate((key) => typeof key === "string" && key.includes("/post"));
            mutate((key) => typeof key === "string" && key.includes("/comment"));
            onCommented && onCommented(commentResponse);

            showToast(tComment("COMMENT_MESSAGE.COMMENTED_SUCCESS"), "success");
        } catch (error: any) {
            console.error(error);
            showToast("Failed to comment", "error");
        } finally {
            stopLoading();
        }
    };

    useEffect(() => {
        return () => {
            unReply();
        };
    }, []);

    return (
        <div>
            {replyTo && (
                <div className="flex items-center justify-between mb-2 pe-4">
                    <div className="flex items-center justify-center w-[40px]">
                        <RedoIcon size={24} />
                    </div>

                    <div className="flex-1 px-3 max-w-full truncate">
                        <span className="text-link">@{replyTo?.commentBy?.username ?? "Sommeone"}</span>
                        &nbsp;
                        {/* Comment */}
                        <span className="text-default-500 text-sm">{parse(replyTo?.content ?? "", parserOptions)}</span>
                    </div>

                    <Button size="sm" radius="full" isIconOnly variant="light" onPress={() => unReply()}>
                        <XIcon size={20} />
                    </Button>
                </div>
            )}
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    if (comment.trim().length > 0) {
                        handleSubmit();
                    }
                }}
                className="flex items-end"
            >
                <Avatar size="sm" src={currentUser?.photo} className="!size-[40px]" />

                <div className="min-h-[40px] relative p-2 px-3 flex-1 flex items-end ms-3 bg-content2 border border-divider rounded-3xl">
                    {/* Content input */}
                    <RichTextEditor
                        isMention={true}
                        isTag={true}
                        ref={commentInputRef}
                        handleInputChange={(value) => {
                            setComment(value);
                        }}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" && !event.shiftKey) {
                                event.preventDefault();
                                if (comment.trim().length > 0) {
                                    handleSubmit();
                                }
                            }
                        }}
                        className="leading-[1.6] flex-1"
                        placeholder={tComment("COMMENT_PLACEHOLDER") + "..."}
                    />

                    <EmojiPicker
                        placement="top"
                        contentRef={commentInputRef}
                        onAfterPicked={() => {
                            if (commentInputRef.current) setComment(commentInputRef.current?.innerHTML);
                        }}
                        button={
                            <button className="outline-none mb-[1px] ms-2">
                                <SmileIcon className="text-muted-foreground" size={18} />
                            </button>
                        }
                    />
                </div>
                <Button
                    isDisabled={comment.replace(/&nbsp;|<[^>]*>/g, "").trim().length === 0}
                    size="sm"
                    variant="flat"
                    className="bg-transparent !size-[40px]"
                    disableRipple
                    type="submit"
                >
                    {loading ? <Spinner size="sm" /> : <SendHorizontalIcon size={20} />}
                </Button>
            </form>
        </div>
    );
}
