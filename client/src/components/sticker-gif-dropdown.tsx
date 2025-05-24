"use client";

import React, { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverProps, PopoverTrigger, Spinner, Tab, Tabs } from "@heroui/react";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { Grid } from "@giphy/react-components";
import useSWR from "swr";
import { ISticker } from "@/types/sticker";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, HashNavigation } from "swiper/modules";
import { ENV } from "@/config/env";

const gf = new GiphyFetch(ENV.GIPHY_API_KEY as string);

interface IProps {
    popoverProps?: Omit<PopoverProps, "children">;
    children?: React.ReactNode;
    onAfterPicked?: (type: "sticker" | "gif", url: string) => void;
}

export default function StickerGifDropdown({ popoverProps, children, onAfterPicked }: IProps) {
    const [type, setType] = useState<"sticker" | "gif">("sticker");
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [currentStickerIndex, setCurrentStickerIndex] = useState<number | null>(null);

    const { data: stickerData, isLoading } = useSWR<{ data: ISticker[] }>(type === "sticker" ? "/sticker" : null);

    useEffect(() => {
        if (stickerData && stickerData.data.length) {
            setCurrentStickerIndex(0); // First sticker package
        }
    }, [stickerData]);

    const handlePick = (url: string) => {
        setIsOpen(false);
        onAfterPicked && onAfterPicked(type, url);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
    };

    return (
        <Popover {...popoverProps} onOpenChange={handleOpenChange} isOpen={isOpen} offset={10}>
            <PopoverTrigger>{children}</PopoverTrigger>
            <PopoverContent className="p-4">
                <div className="max-w-[320px] overflow-hidden">
                    <div className={`${stickerData ? "mb-0" : "mb-5"}`}>
                        <Tabs onSelectionChange={(key) => setType(key.toString() as typeof type)} size="sm" fullWidth>
                            <Tab key="sticker" title="Sticker" />
                            <Tab key="gif" title="GIF" />
                        </Tabs>

                        {/* Sticker packages */}
                        {stickerData && (
                            <div className="py-4 overflow-hidden w-full">
                                <Swiper
                                    hashNavigation={{
                                        watchState: true,
                                    }}
                                    spaceBetween={10}
                                    slidesPerView={4}
                                    centeredSlides={true}
                                    navigation={true}
                                    allowTouchMove
                                    modules={[Navigation, HashNavigation]}
                                    className="max-w-full  h-[50px]"
                                >
                                    {stickerData &&
                                        stickerData?.data?.map((sticker, index) => (
                                            <SwiperSlide key={sticker?._id || index}>
                                                <div
                                                    onClick={() => setCurrentStickerIndex(index)}
                                                    className={`cursor-pointer size-[50px] rounded-full overflow-hidden ${
                                                        currentStickerIndex === index ? "bg-content2 border-2" : ""
                                                    }`}
                                                >
                                                    <Image
                                                        src={sticker?.thumbnail}
                                                        alt=""
                                                        className="!size-[50px] rounded-lg"
                                                        sizes="50px"
                                                        title={sticker?.name}
                                                        width={0}
                                                        height={0}
                                                    />
                                                </div>
                                            </SwiperSlide>
                                        ))}
                                </Swiper>
                            </div>
                        )}
                    </div>

                    <div className="h-[300px] min-w-[300px] overflow-y-auto scrollbar">
                        {type === "sticker" ? (
                            <>
                                {isLoading && (
                                    <div className="flex justify-center items-center">
                                        <Spinner size="md" />
                                    </div>
                                )}
                                {!isLoading && (
                                    <div className="grid grid-cols-12 gap-2 pe-2">
                                        {stickerData &&
                                            stickerData?.data[currentStickerIndex as number]?.stickers?.map(
                                                (sticker) => (
                                                    <div
                                                        className="col-span-4"
                                                        key={sticker.publicId}
                                                        onClick={() => handlePick(sticker.url)}
                                                    >
                                                        <Image
                                                            src={sticker.url}
                                                            alt=""
                                                            className="!size-[100px] cursor-pointer p-1 rounded-lg overflow-hidden hover:bg-content2"
                                                            sizes="100vw"
                                                            width={0}
                                                            height={0}
                                                        />
                                                    </div>
                                                )
                                            )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="rounded-xl pe-2">
                                <Grid
                                    key="gif"
                                    onGifClick={(gif, e) => {
                                        e.preventDefault();
                                        handlePick(gif.embed_url);
                                    }}
                                    width={300}
                                    columns={3}
                                    fetchGifs={(offset: number) => gf.trending({ offset, limit: 15 })}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
