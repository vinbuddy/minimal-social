"use client";

import React, { useState } from "react";
import { Popover, PopoverContent, PopoverProps, PopoverTrigger, Tab, Tabs } from "@nextui-org/react";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { Grid } from "@giphy/react-components";

const gf = new GiphyFetch(process.env.NEXT_PUBLIC_GIPHY_API_KEY as string);

interface IProps {
    popoverProps?: Omit<PopoverProps, "children">;
    children?: React.ReactNode;
}

export default function StickerGifDropdown({ popoverProps, children }: IProps) {
    const [type, setType] = useState<"sticker" | "gif">("sticker");
    return (
        <Popover {...popoverProps} offset={10}>
            <PopoverTrigger>{children}</PopoverTrigger>
            <PopoverContent className="p-4">
                <div>
                    <div className="mb-5">
                        <Tabs
                            onSelectionChange={(key) => setType(key.toString() as typeof type)}
                            size="sm"
                            // variant="solid"
                            fullWidth
                        >
                            <Tab key="sticker" title="Sticker" />
                            <Tab key="gif" title="GIF" />
                        </Tabs>
                    </div>

                    <div className="h-[300px] min-w-[300px] overflow-y-auto scrollbar ">
                        {type === "sticker" ? (
                            <></>
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
