"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { useTranslation } from "react-i18next";

import { ReelFeed, ReelSlideSkeleton, ReelUploadModalButton } from "@/components/reel";
import { IReel } from "@/types/reel";

export default function ReelPage({ params }: { params: { id: string } }) {
    const { t: tReel } = useTranslation("reel");
    const searchParams = useSearchParams();
    // Comment notifications link here with ?commentId=…[&rootComment=…] (rootComment when it is a reply)
    const [focusComment] = useState(() => {
        const commentId = searchParams.get("commentId");
        return commentId ? { commentId, rootId: searchParams.get("rootComment") ?? commentId } : undefined;
    });
    // Fetched once: the feed rewrites the address bar while scrolling, which must not refetch this
    const { data, error, isLoading } = useSWR<{ data: IReel }>(`/reel/${params.id}`, {
        revalidateOnFocus: false,
        revalidateIfStale: false,
    });

    return (
        // From md up the content area starts under the fixed rail, so the feed makes room for it itself
        <div className="relative w-full md:ps-[80px]">
            <h1 className="sr-only">{tReel("REELS")}</h1>
            <div className="fixed top-4 right-6 z-10">
                <ReelUploadModalButton />
            </div>

            {isLoading && (
                <div className="h-dvh py-4 flex justify-center">
                    <ReelSlideSkeleton />
                </div>
            )}

            {/* A deleted or hidden reel still lands on the feed, with a note */}
            {error && !isLoading && (
                <>
                    <p className="fixed top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-content2 text-small">
                        {tReel("REEL_NOT_FOUND")}
                    </p>
                    <ReelFeed />
                </>
            )}

            {data?.data && <ReelFeed initialReel={data.data} focusComment={focusComment} />}
        </div>
    );
}
