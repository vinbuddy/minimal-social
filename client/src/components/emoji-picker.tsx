"use client";

import { Button, Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { SmileIcon } from "lucide-react";
import { useTheme } from "next-themes";
import React, { ReactElement, ReactNode } from "react";

import { setCaretAtTheEnd } from "@/utils/editor";

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
    onChange?: (value: string) => void;
    button?: ReactNode | ReactElement | JSX.Element;
    placement?: Placement;
    contentRef?: React.RefObject<HTMLDivElement>;
    onAfterPicked?: () => void;
}

export default function EmojiPicker({ placement = "top-end", button, contentRef, onChange, onAfterPicked }: IProps) {
    const { theme } = useTheme();

    const handlePickEmoji = (emoji: any) => {
        onChange && onChange(emoji.native);

        if (contentRef && contentRef.current) {
            contentRef.current.innerHTML += emoji.native;

            setCaretAtTheEnd(contentRef.current);
            onAfterPicked && onAfterPicked();
        }
    };

    return (
        <Popover placement={placement} offset={10}>
            <PopoverTrigger>
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
                    theme={theme ?? "light"}
                    data={data}
                    maxFrequentRows={1}
                    onEmojiSelect={handlePickEmoji}
                />
            </PopoverContent>
        </Popover>
    );
}
