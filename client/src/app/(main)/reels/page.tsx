"use client";
import { useTranslation } from "react-i18next";

import { ReelFeed, ReelUploadModalButton } from "@/components/reel";

export default function ReelsPage() {
    const { t: tReel } = useTranslation("reel");

    return (
        // From md up the content area starts under the fixed rail, so the feed makes room for it itself
        <div className="relative w-full md:ps-[80px]">
            <h1 className="sr-only">{tReel("REELS")}</h1>
            <div className="fixed top-4 right-6 z-10">
                <ReelUploadModalButton />
            </div>
            <ReelFeed />
        </div>
    );
}
