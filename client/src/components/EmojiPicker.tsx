"use client";

import { Button, Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { SmileIcon } from "lucide-react";
import React, { ReactElement, ReactNode } from "react";

type Placement =
    | "top"
    | "bottom"
    | "right"
    | "left"
    | "top-start"
    | "top-end"
    | "bottom-start"
    | "bottom-end"
    | "left-start"
    | "left-end"
    | "right-start"
    | "right-end";

interface IProps {
    onChange: (value: string) => void;
    button?: ReactNode | ReactElement | JSX.Element;
    placement?: Placement;
}

export default function EmojiPicker({ placement = "top-end", onChange, button }: IProps) {
    return (
        <Popover placement={placement} offset={10}>
            <PopoverTrigger>
                {/* <Button className={buttonClassName} isIconOnly variant="light" radius="full">
                    <SmileIcon className="text-muted-foreground" size={18} />
                </Button> */}
                {button ? (
                    button
                ) : (
                    <Button isIconOnly variant="light" radius="full">
                        <SmileIcon className="text-muted-foreground" size={18} />
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent className="p-0">
                <Picker
                    emojiSize={18}
                    theme="light"
                    data={data}
                    maxFrequentRows={1}
                    onEmojiSelect={(emoji: any) => onChange(emoji.native)}
                />
            </PopoverContent>
        </Popover>
    );
}
