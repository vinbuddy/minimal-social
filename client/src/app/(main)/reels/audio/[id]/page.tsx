"use client";
import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { Avatar, Button, Spinner } from "@heroui/react";
import { BookmarkIcon, Music2Icon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { BackButton, ErrorMessage, ScreenCenterWrapper } from "@/components";
import { AudioPlayer, ReelGrid, ReelUploadModalButton } from "@/components/reel";
import { ReelsIcon, VerifiedIcon } from "@/assets/icons";
import { IAudio } from "@/types/reel";
import axiosInstance from "@/utils/http-request";
import { showToast } from "@/utils/toast";

export default function AudioPage({ params }: { params: { id: string } }) {
    const { t: tReel } = useTranslation("reel");
    const { data, error, isLoading, mutate } = useSWR<{ data: IAudio }>(`/reel/audio/${params.id}`);
    const audio = data?.data;
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const handleToggleSave = async () => {
        if (!audio) return;

        try {
            setIsSaving(true);

            if (audio.isSaved) {
                await axiosInstance.delete(`/reel/audio/${audio._id}/save`);
                showToast(tReel("AUDIO.UNSAVED"), "success");
            } else {
                await axiosInstance.post(`/reel/audio/${audio._id}/save`);
                showToast(tReel("AUDIO.SAVED"), "success");
            }

            mutate({ data: { ...audio, isSaved: !audio.isSaved } }, { revalidate: false });
        } catch (error: any) {
            showToast(error?.response?.data?.message ?? "Failed to save audio", "error");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <ScreenCenterWrapper>
                <Spinner size="lg" />
            </ScreenCenterWrapper>
        );
    }

    if (error || !audio) {
        return (
            <ScreenCenterWrapper>
                <ErrorMessage error={error} customMessage={tReel("AUDIO.NOT_FOUND")} />
            </ScreenCenterWrapper>
        );
    }

    return (
        <div className="flex justify-center w-full">
            <div className="w-[calc(100vw_-_80px)] md:w-[760px]">
                <header className="sticky h-[80px] top-0 z-10 p-4 flex items-center gap-3 bg-background">
                    <BackButton />
                    <h1 className="text-2xl font-bold">{tReel("AUDIO.TITLE")}</h1>
                </header>

                <main className="px-4 pb-10">
                    <section className="flex flex-col sm:flex-row gap-6 py-4">
                        <img
                            src={audio.coverUrl}
                            alt=""
                            className="size-40 shrink-0 rounded-large object-cover bg-content2 mx-auto sm:mx-0"
                        />

                        <div className="flex-1 min-w-0 flex flex-col gap-3">
                            <div>
                                <h2 className="flex items-center gap-2 text-xl font-semibold">
                                    <Music2Icon size={18} className="shrink-0" />
                                    <span className="truncate">{audio.title ?? tReel("AUDIO.ORIGINAL")}</span>
                                </h2>
                                <Link
                                    href={`/profile/${audio.owner?._id}`}
                                    className="inline-flex items-center gap-2 mt-2 font-semibold hover:underline"
                                >
                                    <Avatar src={audio.owner?.photo} size="sm" className="size-6" />
                                    {audio.owner?.username}
                                    {audio.owner?.isVerified && <VerifiedIcon size={14} className="text-verify" />}
                                </Link>
                            </div>

                            <p className="text-default-500 text-small">
                                {tReel("REEL_COUNT", { count: audio.reelCount })}
                            </p>

                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant="flat"
                                    isLoading={isSaving}
                                    onPress={handleToggleSave}
                                    startContent={
                                        !isSaving && (
                                            <BookmarkIcon size={16} fill={audio.isSaved ? "currentColor" : "none"} />
                                        )
                                    }
                                >
                                    {audio.isSaved ? tReel("AUDIO.SAVED") : tReel("AUDIO.SAVE")}
                                </Button>
                                <ReelUploadModalButton presetAudio={audio}>
                                    {(open) => (
                                        <Button color="primary" onPress={open} startContent={<ReelsIcon size={16} />}>
                                            {tReel("AUDIO.USE")}
                                        </Button>
                                    )}
                                </ReelUploadModalButton>
                            </div>

                            <AudioPlayer src={audio.url} duration={audio.duration} />
                        </div>
                    </section>

                    <section className="mt-4 border-t border-divider pt-4">
                        <ReelGrid url={`/reel/audio/${audio._id}/reels`} />
                    </section>
                </main>
            </div>
        </div>
    );
}
