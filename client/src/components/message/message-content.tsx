"use client";
import emojiRegex from "emoji-regex";
import { Chip } from "@nextui-org/react";
import Image from "next/image";
import parse, { domToReact, HTMLReactParserOptions } from "html-react-parser";

import { IMessage } from "@/types/message";
import GalleryImages from "../gallery-images";
import { formatTimeStamp } from "@/utils/datetime";

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

    const convertLinksToAnchors = (content: string) => {
        // Regex URL
        const urlRegex = /(https?:\/\/(?:www\.)?[^\s/$.?#].[^\s]*)/gi;

        // Replace URL -> `<a>`
        return content.replace(
            urlRegex,
            (url) => `<a class="text-link" href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
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

    const messageClassName = `min-w text-[15px] rounded-[18px] px-3 py-2 ${
        isOwnMessage && message?.content ? "order-2 bg-primary text-primary-foreground" : "order-1 bg-content2"
    }`;

    const emojiMessageClassName = `text-2xl rounded-[18px] ${
        isOwnMessage && message?.content ? "order-2 " : "order-1"
    }`;

    const stickerOrGifClassName = `text-2xl rounded-[18px] ${
        (isOwnMessage && message?.stickerUrl) || message?.gifUrl ? "order-2 " : "order-1"
    }`;

    const className = isImojiMessageOnly(message?.content) ? emojiMessageClassName : messageClassName;

    if (message?.excludedFor?.includes(message?.sender?._id)) {
        return null;
    }

    if (message?.content) {
        const content = convertLinksToAnchors(message?.content);
        return (
            <section className={className}>
                <span>{parse(content, parserOptions)}</span>
            </section>
        );
    }

    if (!message?.content && message?.stickerUrl) {
        return (
            <section className={stickerOrGifClassName}>
                <Image
                    className="size-[100px] rounded-xl object-cover"
                    width={0}
                    height={0}
                    sizes="100vw"
                    src={message?.stickerUrl || ""}
                    alt=""
                />
            </section>
        );
    } else if (!message?.content && message?.gifUrl) {
        return (
            <section className={stickerOrGifClassName}>
                <iframe
                    className="size-[200px] shadow-none rounded-xl"
                    src={message?.gifUrl || ""}
                    allowFullScreen
                    scrolling="no"
                    allow="encrypted-media"
                ></iframe>
            </section>
        );
    }

    return (
        <>
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
