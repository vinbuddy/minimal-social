"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@heroui/react";
import { ClockIcon, Music2Icon } from "lucide-react";
import { useTranslation } from "react-i18next";

import ReelPlayer from "./reel-player";
import ReelActions from "./reel-actions";
import ReelCaption from "./reel-caption";
import ReelCommentsDrawer, { IFocusComment } from "./reel-comments-drawer";
import { VerifiedIcon } from "@/assets/icons";
import { useIsOwner } from "@/hooks";
import { useAuthStore, useReelStore } from "@/hooks/store";
import { IReel } from "@/types/reel";
import axiosInstance from "@/utils/http-request";
import { showToast } from "@/utils/toast";

interface IProps {
    reel: IReel;
    isActive: boolean;
    preload: "auto" | "metadata" | "none";
    onDeleted?: (reel: IReel) => void;
    // From a comment notification: comments open on that comment
    focusComment?: IFocusComment;
}

// Watching this long counts as a view
const VIEW_THRESHOLD_MS = 2000;

export default function ReelItem({ reel, isActive, preload, onDeleted, focusComment }: IProps) {
    const { currentUser } = useAuthStore();
    const isOwner = useIsOwner(reel.reelBy._id);
    const { t: tReel } = useTranslation("reel");
    const { t: tUser } = useTranslation("user");

    const [isLiked, setIsLiked] = useState<boolean>(reel.isLiked);
    const [likeCount, setLikeCount] = useState<number>(reel.likeCount);
    const [commentCount, setCommentCount] = useState<number>(reel.commentCount);
    const [isFollowing, setIsFollowing] = useState<boolean>(reel.isFollowing);
    const [isCommentsOpen, setIsCommentsOpen] = useState<boolean>(Boolean(focusComment) && isActive);

    useEffect(() => {
        if (!isActive) return;

        const timeout = setTimeout(() => {
            if (useReelStore.getState().markViewed(reel._id)) {
                axiosInstance.post(`/reel/${reel._id}/view`).catch(() => {});
            }
        }, VIEW_THRESHOLD_MS);

        return () => clearTimeout(timeout);
    }, [isActive, reel._id]);

    // Close comments when the reel scrolls away
    useEffect(() => {
        if (!isActive) setIsCommentsOpen(false);
    }, [isActive]);

    const handleLike = async () => {
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);

        try {
            const response = await axiosInstance.post("/reel/like", { reelId: reel._id });
            setLikeCount(response.data.data.likeCount);

            if (!isOwner) {
                await axiosInstance.post("/notification", {
                    target: reel._id,
                    targetType: "Reel",
                    action: "like",
                    photo: currentUser?.photo,
                    message: tReel("REEL_LIKED_YOUR_REEL"),
                    sender: currentUser?._id,
                    receivers: [reel.reelBy._id],
                    url: `/reels/${reel._id}`,
                });
            }
        } catch (error: any) {
            setIsLiked(false);
            setLikeCount((prev) => prev - 1);
            showToast(error?.response?.data?.message ?? "Failed to like reel", "error");
        }
    };

    const handleUnlike = async () => {
        setIsLiked(false);
        setLikeCount((prev) => Math.max(prev - 1, 0));

        try {
            const response = await axiosInstance.post("/reel/unlike", { reelId: reel._id });
            setLikeCount(response.data.data.likeCount);
        } catch (error: any) {
            setIsLiked(true);
            setLikeCount((prev) => prev + 1);
            showToast(error?.response?.data?.message ?? "Failed to unlike reel", "error");
        }
    };

    const handleFollow = async () => {
        setIsFollowing(true);

        try {
            await axiosInstance.put("/user/follow", { userId: reel.reelBy._id });
            await axiosInstance.post("/notification", {
                target: reel.reelBy._id,
                targetType: "User",
                action: "follow",
                photo: currentUser?.photo,
                message: `followed you`,
                sender: currentUser?._id,
                receivers: [reel.reelBy._id],
                url: `/profile/${currentUser?._id}`,
            });
        } catch (error: any) {
            setIsFollowing(false);
            showToast(error?.response?.data?.message ?? "Failed to follow user", "error");
        }
    };

    return (
        <div className="relative flex items-end gap-4 h-full">
            {/* Video frame: always 9:16, as wide as the height allows */}
            <div className="relative h-full aspect-[9/16] max-w-full md:rounded-large overflow-hidden bg-black">
                <ReelPlayer
                    video={reel.video}
                    isActive={isActive}
                    preload={preload}
                    onDoubleTap={() => !isLiked && handleLike()}
                />

                {reel.moderationStatus === "pending" && (
                    <span className="absolute top-3 left-3 z-[2] flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 text-white text-tiny pointer-events-none">
                        <ClockIcon size={12} />
                        {tReel("REEL_PENDING")}
                    </span>
                )}

                {/* Author, caption and audio over a bottom scrim */}
                <div className="absolute bottom-0 left-0 right-0 z-[1] pt-24 pb-5 ps-4 pe-16 md:pe-14 bg-gradient-to-t from-black/70 via-black/25 to-transparent pointer-events-none">
                    <div className="flex flex-col gap-2 pointer-events-auto">
                        <div className="flex items-center gap-2 text-white">
                            <Link href={`/profile/${reel.reelBy._id}`} className="shrink-0">
                                <Avatar src={reel.reelBy.photo} alt={reel.reelBy.username} size="sm" className="size-8" />
                            </Link>
                            <Link
                                href={`/profile/${reel.reelBy._id}`}
                                className="flex items-center text-sm font-semibold hover:underline"
                            >
                                {reel.reelBy.username}
                                {reel.reelBy.isVerified && <VerifiedIcon size={14} className="text-verify ms-1.5" />}
                            </Link>
                            {!isOwner && !isFollowing && (
                                <>
                                    <span aria-hidden>•</span>
                                    <button
                                        type="button"
                                        onClick={handleFollow}
                                        className="text-sm font-semibold outline-none hover:opacity-70 focus-visible:underline"
                                    >
                                        {tUser("USER.FOLLOW")}
                                    </button>
                                </>
                            )}
                        </div>

                        <ReelCaption caption={reel.caption} />

                        {reel.audio && (
                            <Link
                                href={`/reels/audio/${reel.audio._id}`}
                                className="flex items-center gap-1.5 max-w-full text-tiny text-white hover:underline"
                            >
                                <Music2Icon size={12} className="shrink-0" />
                                <span className="truncate">
                                    {reel.audio.owner?.username} · {reel.audio.title ?? tReel("AUDIO.ORIGINAL")}
                                </span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions: over the video on phones, beside it from md up */}
            <div className="absolute bottom-16 right-2 z-[2] text-white drop-shadow md:static md:text-foreground md:drop-shadow-none md:pb-1">
                <ReelActions
                    reel={reel}
                    isLiked={isLiked}
                    likeCount={likeCount}
                    commentCount={commentCount}
                    onToggleLike={isLiked ? handleUnlike : handleLike}
                    onOpenComments={() => setIsCommentsOpen(true)}
                    onDeleted={onDeleted}
                />
            </div>

            <ReelCommentsDrawer
                reel={reel}
                isOpen={isCommentsOpen}
                onOpenChange={setIsCommentsOpen}
                onCommented={() => setCommentCount((prev) => prev + 1)}
                focusComment={focusComment}
            />
        </div>
    );
}
