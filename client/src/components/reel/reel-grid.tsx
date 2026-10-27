"use client";
import Link from "next/link";
import { Spinner } from "@heroui/react";
import { ClockIcon, EyeIcon } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useTranslation } from "react-i18next";

import ReelGridSkeletons from "./reel-skeletons";
import { CommentIcon, HeartIcon } from "@/assets/icons";
import { ErrorMessage } from "@/components";
import { usePagination } from "@/hooks";
import { IReel } from "@/types/reel";
import { formatCompactNumber } from "@/utils/reel";

interface IProps {
    url: string;
    emptyMessage?: string;
}

/** Three-column wall of reel covers, used by the profile tab and the audio page */
export default function ReelGrid({ url, emptyMessage }: IProps) {
    const { t: tReel, i18n } = useTranslation("reel");
    const { data: reels, isLoading, error, isReachedEnd, size, setSize } = usePagination<IReel>(url);

    if (isLoading) return <ReelGridSkeletons />;

    if (error) return <ErrorMessage className="text-danger" error={error} />;

    if (reels.length === 0) {
        return <p className="text-center text-default-500 py-10">{emptyMessage ?? tReel("REEL_EMPTY")}</p>;
    }

    return (
        <InfiniteScroll
            next={() => setSize(size + 1)}
            hasMore={!isReachedEnd}
            loader={
                <div className="flex justify-center items-center overflow-hidden h-[70px]">
                    <Spinner size="md" />
                </div>
            }
            dataLength={reels.length}
        >
            <div className="grid grid-cols-3 gap-1">
                {reels.map((reel) => (
                    <Link
                        key={reel._id}
                        href={`/reels/${reel._id}`}
                        className="group relative block aspect-[9/16] overflow-hidden bg-content2 outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
                    >
                        <img
                            src={reel.video.thumbnailUrl}
                            alt={reel.reelBy.username}
                            loading="lazy"
                            className="w-full h-full object-cover"
                        />

                        {reel.moderationStatus === "pending" && (
                            <span
                                title={tReel("REEL_PENDING_HINT")}
                                className="absolute top-2 right-2 flex items-center justify-center size-6 rounded-full bg-black/50 text-white"
                            >
                                <ClockIcon size={14} />
                            </span>
                        )}

                        <div className="absolute bottom-0 left-0 right-0 flex items-center gap-1 p-2 text-white text-sm font-semibold bg-gradient-to-t from-black/50 to-transparent">
                            <EyeIcon size={16} />
                            <span>{formatCompactNumber(reel.viewCount, i18n.language)}</span>
                        </div>

                        {/* Likes and comments on hover */}
                        <div className="absolute inset-0 hidden group-hover:flex items-center justify-center gap-5 bg-black/30 text-white font-semibold">
                            <span className="flex items-center gap-1.5">
                                <HeartIcon isFilled size={18} />
                                {formatCompactNumber(reel.likeCount, i18n.language)}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <CommentIcon isFilled size={18} />
                                {formatCompactNumber(reel.commentCount, i18n.language)}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </InfiniteScroll>
    );
}
