"use client";
import { useEffect, useRef, useState } from "react";
import parse, { domToReact, HTMLReactParserOptions } from "html-react-parser";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface IProps {
    caption: string;
}

// Same link handling as post captions: profile mentions become client-side links
const parserOptions: HTMLReactParserOptions = {
    replace({ attribs, children }: any) {
        if (!attribs) return;

        if (attribs.class === "text-link") {
            return (
                <Link href={attribs.href} className="font-semibold hover:underline">
                    {domToReact(children, parserOptions)}
                </Link>
            );
        }
    },
};

export default function ReelCaption({ caption }: IProps) {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [isClamped, setIsClamped] = useState<boolean>(false);
    const textRef = useRef<HTMLDivElement | null>(null);
    const { t: tReel } = useTranslation("reel");

    useEffect(() => {
        const element = textRef.current;
        if (element) setIsClamped(element.scrollHeight > element.clientHeight + 1);
    }, [caption]);

    if (!caption) return null;

    return (
        <div className="text-sm text-white">
            <div
                ref={textRef}
                className={
                    isExpanded ? "max-h-40 overflow-y-auto no-scrollbar whitespace-pre-line" : "line-clamp-2 break-words"
                }
            >
                {parse(caption, parserOptions)}
            </div>
            {(isClamped || isExpanded) && (
                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-white/70 hover:text-white font-medium outline-none"
                >
                    {isExpanded ? tReel("REEL_LESS") : `... ${tReel("REEL_MORE")}`}
                </button>
            )}
        </div>
    );
}
