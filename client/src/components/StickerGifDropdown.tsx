"use client";

import React, { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverProps, PopoverTrigger, Spinner, Tab, Tabs } from "@nextui-org/react";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { Grid } from "@giphy/react-components";
import useSWR from "swr";
import { ISticker } from "@/types/sticker";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, HashNavigation } from "swiper/modules";

const gf = new GiphyFetch(process.env.NEXT_PUBLIC_GIPHY_API_KEY as string);

interface IProps {
    popoverProps?: Omit<PopoverProps, "children">;
    children?: React.ReactNode;
}

export default function StickerGifDropdown({ popoverProps, children }: IProps) {
    const [type, setType] = useState<"sticker" | "gif">("sticker");
    const [currentStickerIndex, setCurrentStickerIndex] = useState<number | null>(null);

    const { data: stickerData, isLoading } = useSWR<{ data: ISticker[] }>(type === "sticker" ? "/sticker" : null);

    useEffect(() => {
        if (stickerData && stickerData.data.length) {
            setCurrentStickerIndex(0); // First sticker package
        }
    }, [stickerData]);

    return (
        <Popover {...popoverProps} offset={10}>
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
                                    slidesPerView="auto"
                                    spaceBetween={20}
                                    navigation={true}
                                    allowTouchMove
                                    modules={[Navigation, HashNavigation]}
                                    className="max-w-full  h-[40px]"
                                >
                                    {stickerData &&
                                        stickerData?.data?.map((sticker, index) => (
                                            <SwiperSlide key={sticker?._id}>
                                                <div
                                                    onClick={() => setCurrentStickerIndex(index)}
                                                    className={`cursor-pointer size-[40px] rounded-lg overflow-hidden bg-content2 mr-2 ${
                                                        currentStickerIndex === index ? "bg-content2" : ""
                                                    }`}
                                                >
                                                    <Image
                                                        src={sticker?.thumbnail}
                                                        alt=""
                                                        className="!size-[40px] rounded-lg"
                                                        sizes="40px"
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
                                                    <div key={sticker.publicId} className="col-span-4">
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
