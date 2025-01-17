import { Popover, PopoverTrigger, PopoverContent, Button, PopoverProps } from "@heroui/react";
import { useState } from "react";

interface IProps {
    children: React.ReactNode;
    popoverProps?: PopoverProps;
    onAfterPicked: (emoji: string) => void;
}

export default function MessageEmojiReaction({ children, popoverProps, onAfterPicked }: IProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const handlePickEmoji = (emoji: string) => {
        setIsOpen(false);
        onAfterPicked && onAfterPicked(emoji);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
    };

    return (
        <Popover onOpenChange={handleOpenChange} isOpen={isOpen} offset={10} {...popoverProps}>
            <PopoverTrigger>{children}</PopoverTrigger>
            <PopoverContent className=" rounded-full">
                <ul className="flex items-center gap-2 py-1 px-2 text-2xl [&_li]:cursor-pointer">
                    <li onClick={() => handlePickEmoji("❤️")}>❤️</li>
                    <li onClick={() => handlePickEmoji("😆")}>😆</li>
                    <li onClick={() => handlePickEmoji("😯")}>😯</li>
                    <li onClick={() => handlePickEmoji("😡")}>😡</li>
                    <li onClick={() => handlePickEmoji("👍")}>👍</li>
                </ul>
            </PopoverContent>
        </Popover>
    );
}
