"use client";
import { Avatar, Button, Spinner } from "@nextui-org/react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { RedoIcon, SendHorizontalIcon, SmileIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import parse, { domToReact, HTMLReactParserOptions } from "html-react-parser";

import RichTextEditor from "@/components/rich-text-editor";
import EmojiPicker from "../emoji-picker";
import axiosInstance from "@/utils/http-request";
import { useAuthStore, useReplyStore } from "@/hooks/store";
import { useGlobalMutation, useLoading } from "@/hooks";
import { showToast } from "@/utils/toast";
import { IComment } from "@/types/comment";
import { IPost } from "@/types/post";

// type TargetType = IPost | IVideo;
type CommentTargetType = IPost;

interface IProps<T extends CommentTargetType, TT> {
    target: T;
    targetType: TT;
}

export default function CommentForm<T extends CommentTargetType, TT extends "Post" | "Video">({
    targetType,
    target,
}: IProps<T, TT>) {
    const params: { id: string } = useParams();
    const { currentUser } = useAuthStore();
    const { startLoading, stopLoading, loading } = useLoading();
    const mutate = useGlobalMutation();
    const { replyTo, unReply } = useReplyStore();

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

    const handleSubmit = async () => {
        // e.preventDefault();

        if (!comment.trim()) return;

        try {
            startLoading();

            const data = {
                commentBy: currentUser?._id,
                content: comment,
                target: params.id,
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
                    message: `commented on your post`,
                    sender: currentUser?._id,
                    receivers: [target?.postBy?._id],
                    url: `/post/${params?.id}?commentId=${commentResponse?._id}`,
                });
            } else {
                await axiosInstance.post("/notification", {
                    target: commentResponse?._id,
                    targetType: "Comment",
                    action: "comment",
                    photo: currentUser?.photo,
                    message: `replied on your comment`,
                    sender: currentUser?._id,
                    receivers: [replyTo?.commentBy?._id],
                    url: `/post/${params?.id}?commentId=${commentResponse?._id}&rootComment=${
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

            if (targetType === "Post") {
                mutate((key) => typeof key === "string" && key.includes("/post"));
                mutate((key) => typeof key === "string" && key.includes("/comment"));
            }

            showToast("Commented successfully", "success");
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
                        placeholder="Type your comment..."
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
