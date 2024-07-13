"use client";
import { CommentIcon, HeartIcon, RepostIcon } from "@/assets/icons";
import useAuthStore from "@/hooks/store/useAuthStore";
import { IPost } from "@/types/post";
import axiosInstance from "@/utils/httpRequest";
import { Button } from "@nextui-org/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface IProps {
    post: IPost;
}

export default function PostActions({ post }: IProps) {
    const { currentUser } = useAuthStore();
    const [isLiked, setIsLiked] = useState<boolean>(() => post?.likes.includes(currentUser?._id) || false);
    const [likeCount, setLikeCount] = useState<number>(post?.likeCount ?? 0);

    const handleUnLike = async (): Promise<void> => {
        setIsLiked(false);
        setLikeCount((prev) => prev - 1);

        if (!currentUser?._id || !post?._id) return;

        try {
            const response = await axiosInstance.put("/post/unlike", {
                postId: post._id,
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
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);

        try {
            const response = await axiosInstance.put("/post/like", {
                postId: post._id,
                userId: currentUser?._id,
            });

            toast.success("Liked post successfully", {
                position: "bottom-center",
            });
        } catch (error: any) {
            setIsLiked(false);
            setLikeCount((prev) => prev - 1);

            toast.error("Failed to unlike post", {
                position: "bottom-center",
            });
            console.log(error.response.data.message);
        }
    };

    return (
        <div>
            <Button
                title="like"
                onClick={isLiked ? handleUnLike : handleLike}
                size="sm"
                radius="full"
                color={isLiked ? "danger" : "default"}
                variant="light"
                startContent={<HeartIcon isFilled={isLiked} size={18} />}
            >
                {likeCount}
            </Button>
            <Button
                title="comment"
                href={`/post/${post?._id}`}
                as={Link}
                size="sm"
                radius="full"
                variant="light"
                startContent={<CommentIcon isFilled={false} size={18} />}
            >
                {post?.commentCount ?? 0}
            </Button>

            <Button
                title="repost"
                isIconOnly
                size="sm"
                radius="full"
                variant="light"
                startContent={<RepostIcon size={18} />}
            />
        </div>
    );
}
