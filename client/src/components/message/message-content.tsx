"use client";
import emojiRegex from "emoji-regex";
import { Chip } from "@heroui/react";
import Image from "next/image";
import parse, { domToReact, HTMLReactParserOptions } from "html-react-parser";
import { CSSProperties } from "react";
import cn from "classnames";

import { IMessage } from "@/types/message";
import GalleryMediaFiles from "../media/gallery-media-files";
import { formatTime, formatTimeStamp } from "@/utils/datetime";
import { IConversation } from "@/types/conversation";
import { useMessagesStore } from "@/hooks/store";

interface IProps {
    message: IMessage;
    isOwnMessage: boolean;
    conversation: IConversation;
}

export default function MessageContent({ message, isOwnMessage, conversation }: IProps) {
    const { messageIdReferenced } = useMessagesStore();

    const isEmojiMessageOnly = (content: string): boolean => {
        const regex = emojiRegex();
        const match = content && content.match(regex);

        if (!match) return false;

        return match && match.length === 1 && match[0] === content;
    };

    const convertLinksToAnchors = (content: string) => {
        // Regex URL
        const urlRegex = /(https?:\/\/(?:www\.)?[^\s/$.?#].[^\s]*)/gi;

        // Replace URL -> `<a>`
        return content.replace(
            urlRegex,
            (url) =>
                `<a class="text-primary-foreground underline font-medium" href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
        );
    };

    const parserOptions: HTMLReactParserOptions = {
        replace({ attribs, children }: any) {
            if (!attribs) {
                return;
            }

            if (attribs.class === "text-link") {
                return (
                    <a target="_blank" href={attribs.href} className="text-link cursor-pointer hover:underline">
                        {domToReact(children, parserOptions)}
                    </a>
                );
            }
        },
    };

    const getMessageStyle = (): string => {
        if (isEmojiMessageOnly(message?.content || "")) {
            return cn("text-2xl rounded-[18px]", {
                "order-2": isOwnMessage,
                "order-1": !isOwnMessage,
                "border-4 border-default-400": messageIdReferenced === message._id,
            });
        }

        return cn("min-w text-[15px] rounded-[18px] px-3 py-2", {
            "order-2 bg-primary text-primary-foreground": isOwnMessage,
            "order-1 bg-content2": !isOwnMessage,
            "border-4 border-default-400": messageIdReferenced === message._id,
        });
    };

    const getThemeStyle = (): CSSProperties | undefined => {
        return isOwnMessage && !isEmojiMessageOnly(message?.content)
            ? { backgroundColor: conversation?.theme?.color, color: "white" }
            : undefined;
    };

    if (message?.isRetracted) {
        return (
            <section style={getThemeStyle()} className={getMessageStyle()}>
                <span className="text-default-400 italic">This message was retracted</span>
            </section>
        );
    }

    if (message?.content) {
        const content = convertLinksToAnchors(message.content);
        return (
            <section style={getThemeStyle()} className={getMessageStyle()}>
                <span>{parse(content, parserOptions)}</span>
            </section>
        );
    }

    if (message?.stickerUrl) {
        return (
            <section className={cn("text-2xl rounded-[18px]", { "order-2": isOwnMessage, "order-1": !isOwnMessage })}>
                <Image
                    className="size-[100px] rounded-xl object-cover"
                    width={100}
                    height={100}
                    src={message.stickerUrl}
                    alt="Sticker"
                />
            </section>
        );
    }

    if (message?.gifUrl) {
        return (
            <section className={cn("text-2xl rounded-[18px]", { "order-2": isOwnMessage, "order-1": !isOwnMessage })}>
                <iframe
                    className="size-[200px] shadow-none rounded-xl"
                    src={message.gifUrl}
                    allowFullScreen
                    scrolling="no"
                    allow="encrypted-media"
                ></iframe>
            </section>
        );
    }

    if (message?.mediaFiles?.length > 0) {
        return (
            <section
                className={cn("max-w-full overflow-hidden", {
                    "order-2 [&_.swiper-slide]:first:!me-0": isOwnMessage,
                    "order-1": !isOwnMessage,
                })}
            >
                <GalleryMediaFiles mediaFiles={message.mediaFiles} />
                <div className={cn("flex mt-1", { "justify-end": isOwnMessage, "justify-start": !isOwnMessage })}>
                    <Chip size="sm" variant="flat" className="px-1 text-default-500 text-tiny">
                        {formatTime(message.createdAt)}
                    </Chip>
                </div>
            </section>
        );
    }
}
