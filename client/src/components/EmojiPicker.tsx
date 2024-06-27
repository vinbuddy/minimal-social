"use client";

import { Button, Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { SmileIcon } from "lucide-react";

interface IProps {
    onChange: (value: string) => void;
}

export default function EmojiPicker({ onChange }: IProps) {
    return (
        <Popover placement="top-end" offset={10}>
            <PopoverTrigger>
                <Button isIconOnly variant="light" radius="full">
                    <SmileIcon className="text-muted-foreground" size={18} />
                </Button>
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
