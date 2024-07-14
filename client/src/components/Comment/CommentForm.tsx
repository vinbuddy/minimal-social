"use client";
import { Avatar, Button, Spinner } from "@nextui-org/react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LoaderCircleIcon, LoaderIcon, RedoIcon, SendHorizontalIcon, SmileIcon, XIcon } from "lucide-react";

import RichTextEditor from "@/components/RichTextEditor";
import useAuthStore from "@/hooks/store/useAuthStore";
import EmojiPicker from "../EmojiPicker";
import useLoading from "@/hooks/useLoading";
import axiosInstance from "@/utils/httpRequest";
import { toast } from "sonner";
import { TOAST_OPTIONS } from "@/utils/toast";
import useGlobalMutation from "@/hooks/useGlobalMutation";
import useCommentStore from "@/hooks/store/useCommentStore";
import parse, { domToReact, HTMLReactParserOptions } from "html-react-parser";

interface IProps {
    targetType: "Post" | "Video";
}

export default function CommentForm({ targetType }: IProps) {
    const params: { id: string } = useParams();
    const { currentUser } = useAuthStore();
    const { startLoading, stopLoading, loading } = useLoading();
    const mutate = useGlobalMutation();
    const { replyTo, unReply } = useCommentStore();

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

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

            if (commentInputRef.current) {
                commentInputRef.current.innerHTML = "";
                setComment("");
                unReply();
            }

            if (targetType === "Post") {
                mutate((key) => typeof key === "string" && key.includes("/post"));
                mutate((key) => typeof key === "string" && key.includes("/comment"));
            }

            toast.success("Commented successfully", TOAST_OPTIONS);
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to comment", TOAST_OPTIONS);
            toast.error(error.response?.data?.message, TOAST_OPTIONS);
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
            <form onSubmit={handleSubmit} className="flex items-end">
                <Avatar size="sm" src={currentUser?.photo} className="!size-[40px]" />

                <div className="min-h-[40px] p-2 px-3 flex-1 flex items-end ms-3 bg-content2 border border-divider rounded-xl">
                    {/* Content input */}
                    <RichTextEditor
                        isMention={true}
                        isTag={true}
                        ref={commentInputRef}
                        handleInputChange={(value) => {
                            setComment(value);
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
                            <button className="outline-none">
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
