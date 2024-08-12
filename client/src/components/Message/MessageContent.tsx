"use client";
import { IMessage } from "@/types/message";
import GalleryImages from "../GalleryImages";
import emojiRegex from "emoji-regex";
import { formatTimeStamp } from "@/utils/datetime";
import { Chip } from "@nextui-org/react";

interface IProps {
    message: IMessage;
    isOwnMessage: boolean;
}

export default function MessageContent({ message, isOwnMessage }: IProps) {
    const isImojiMessageOnly = (content: string): boolean => {
        const regex = emojiRegex();
        const match = content && content.match(regex);

        if (!match) return false;

        return match && match.length === 1 && match[0] === content;
    };

    const messageClassName = `min-w text-[15px] rounded-[18px] px-3 py-2 ${
        isOwnMessage && message?.content ? "order-2 bg-primary text-primary-foreground" : "order-1 bg-content2"
    }`;

    const emojiMessageClassName = `text-2xl rounded-[18px] ${
        isOwnMessage && message?.content ? "order-2 " : "order-1"
    }`;

    const className = isImojiMessageOnly(message?.content) ? emojiMessageClassName : messageClassName;

    return (
        <>
            {message?.content && (
                <section className={className}>
                    <span>{message?.content}</span>
                </section>
            )}

            {message?.mediaFiles?.length > 0 && (
                <section
                    className={`max-w-full overflow-hidden ${
                        isOwnMessage && message?.mediaFiles.length > 0
                            ? "order-2 [&_.swiper-slide]:first:!me-0"
                            : "order-1"
                    }`}
                >
                    <GalleryImages images={message?.mediaFiles} />
                    <div className={`flex mt-1 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                        <Chip size="sm" variant="flat" className={`px-1 text-default-500 text-tiny`}>
                            {formatTimeStamp(message?.createdAt)}
                        </Chip>
                    </div>
                </section>
            )}
        </>
    );
}
