"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import ReelItem from "./reel-item";
import { IFocusComment } from "./reel-comments-drawer";
import { ReelSlideSkeleton } from "./reel-skeletons";
import { usePagination } from "@/hooks";
import { IReel } from "@/types/reel";

interface IProps {
    // Opened from a link: shown first, then the regular feed continues below it
    initialReel?: IReel;
    // Opened from a comment notification: the initial reel opens its comments on this one
    focusComment?: IFocusComment;
}

// Slides this far from the active one keep a real <video>; the rest are empty frames
const RENDER_BEHIND = 1;
const RENDER_AHEAD = 2;
const LOAD_MORE_THRESHOLD = 3;

export default function ReelFeed({ initialReel, focusComment }: IProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
    const { t: tReel } = useTranslation("reel");

    const {
        data: feed,
        isLoading,
        error,
        isReachedEnd,
        loadingMore,
        size,
        setSize,
    } = usePagination<IReel>(`/reel/feed${initialReel ? `?exclude=${initialReel._id}` : ""}`);

    // The feed is ranked live, so later pages can repeat a reel: keep the first occurrence
    const reels = useMemo(() => {
        const seen = new Set<string>();

        return [...(initialReel ? [initialReel] : []), ...feed].filter((reel) => {
            if (!reel || seen.has(reel._id) || removedIds.has(reel._id)) return false;
            seen.add(reel._id);
            return true;
        });
    }, [initialReel, feed, removedIds]);

    // The slide that is at least 60% visible is the active one
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveIndex(Number((entry.target as HTMLElement).dataset.index));
                    }
                });
            },
            { root: container, threshold: 0.6 }
        );

        container.querySelectorAll("[data-reel-slide]").forEach((slide) => observer.observe(slide));

        return () => observer.disconnect();
    }, [reels.length]);

    // Keep the address bar on the reel being watched, so copying it shares that reel
    useEffect(() => {
        const reel = reels[activeIndex];
        if (reel && window.location.pathname !== `/reels/${reel._id}`) {
            window.history.replaceState(window.history.state, "", `/reels/${reel._id}`);
        }
    }, [activeIndex, reels]);

    useEffect(() => {
        if (activeIndex >= reels.length - LOAD_MORE_THRESHOLD && !isReachedEnd && !loadingMore && !isLoading) {
            setSize(size + 1);
        }
    }, [activeIndex, reels.length, isReachedEnd, loadingMore, isLoading, size, setSize]);

    const scrollToIndex = useCallback(
        (index: number) => {
            const container = containerRef.current;
            if (!container) return;

            const target = Math.min(Math.max(index, 0), reels.length - 1);
            container.scrollTo({ top: target * container.clientHeight, behavior: "smooth" });
        },
        [reels.length]
    );

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement;
            const isTyping = target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
            const isDialogOpen = document.querySelector("[role='dialog']") !== null;
            if (isTyping || isDialogOpen) return;

            if (event.key === "ArrowDown") {
                event.preventDefault();
                scrollToIndex(activeIndex + 1);
            } else if (event.key === "ArrowUp") {
                event.preventDefault();
                scrollToIndex(activeIndex - 1);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [activeIndex, scrollToIndex]);

    const handleDeleted = (reel: IReel) => {
        setRemovedIds((prev) => new Set(prev).add(reel._id));
    };

    const getPreload = (index: number): "auto" | "metadata" | "none" => {
        if (index === activeIndex || index === activeIndex + 1) return "auto";
        if (index >= activeIndex - RENDER_BEHIND && index <= activeIndex + RENDER_AHEAD) return "metadata";
        return "none";
    };

    if (isLoading && reels.length === 0) {
        return (
            <div className="h-dvh py-4 flex justify-center">
                <ReelSlideSkeleton />
            </div>
        );
    }

    if (error && reels.length === 0) {
        return (
            <div className="h-dvh flex items-center justify-center">
                <p className="text-danger">{error?.response?.data?.message ?? error?.message}</p>
            </div>
        );
    }

    if (reels.length === 0) {
        return (
            <div className="h-dvh flex items-center justify-center px-4">
                <p className="text-default-500 text-center">{tReel("REEL_FEED_EMPTY")}</p>
            </div>
        );
    }

    return (
        <div className="relative">
            <div
                ref={containerRef}
                className="h-dvh overflow-y-auto snap-y snap-mandatory overscroll-contain no-scrollbar"
            >
                {reels.map((reel, index) => {
                    const isNear = index >= activeIndex - RENDER_BEHIND && index <= activeIndex + RENDER_AHEAD;

                    return (
                        <section
                            key={reel._id}
                            data-reel-slide
                            data-index={index}
                            aria-label={reel.reelBy.username}
                            className="h-dvh snap-start snap-always flex justify-center md:py-4"
                        >
                            {isNear ? (
                                <ReelItem
                                    reel={reel}
                                    isActive={index === activeIndex}
                                    preload={getPreload(index)}
                                    onDeleted={handleDeleted}
                                    focusComment={reel._id === initialReel?._id ? focusComment : undefined}
                                />
                            ) : (
                                <div className="h-full aspect-[9/16] max-w-full md:rounded-large overflow-hidden bg-content2">
                                    <img
                                        src={reel.video.thumbnailUrl}
                                        alt=""
                                        loading="lazy"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                        </section>
                    );
                })}

                {loadingMore && !isReachedEnd && (
                    <div className="h-20 flex items-center justify-center">
                        <Spinner />
                    </div>
                )}
            </div>

            {/* Previous / next */}
            <div className="hidden md:flex flex-col gap-3 fixed right-6 top-1/2 -translate-y-1/2 z-10">
                <Button
                    isIconOnly
                    radius="full"
                    variant="flat"
                    size="lg"
                    aria-label={tReel("REEL_PREVIOUS")}
                    isDisabled={activeIndex === 0}
                    onPress={() => scrollToIndex(activeIndex - 1)}
                    className="bg-content2"
                >
                    <ChevronUpIcon size={22} />
                </Button>
                <Button
                    isIconOnly
                    radius="full"
                    variant="flat"
                    size="lg"
                    aria-label={tReel("REEL_NEXT")}
                    isDisabled={activeIndex >= reels.length - 1}
                    onPress={() => scrollToIndex(activeIndex + 1)}
                    className="bg-content2"
                >
                    <ChevronDownIcon size={22} />
                </Button>
            </div>
        </div>
    );
}
