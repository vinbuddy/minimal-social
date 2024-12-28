"use client";
import { motion } from "framer-motion";

import EmojiReactionsLabel from "./emoji-reactions-label";
import MessageContent from "./message-content";
import MessageActions from "./message-actions";
import { IMessage } from "@/types/message";

interface IProps {
    message: IMessage;
    isOwnMessage: boolean;
}

export default function MessageItemGroup({ message, isOwnMessage }: IProps) {
    const isReaction = message?.reactions?.length > 0;
    return (
        <motion.div
            initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
            transition={{
                opacity: { duration: 0.1 },
                layout: {
                    type: "spring",
                    bounce: 0.3,
                    duration: 0.05 + 0.2,
                },
            }}
            key={message?._id}
        >
            {message?.replyTo ? (
                <div
                    className={`relative flex flex-col !text-sm rounded-[18px] ${isReaction && "top-5"} ${
                        isOwnMessage ? "items-end" : "items-start"
                    }`}
                >
                    <div
                        className={`text-sm text-default-500 rounded-[18px] px-3 pt-2 pb-5 ${
                            isOwnMessage ? "rounded-br-none bg-content2" : "rounded-bl-none bg-content3"
                        }`}
                    >
                        {message?.replyTo?.mediaFiles?.length > 0 && !message?.replyTo?.content
                            ? "Reply to some photo"
                            : message?.replyTo?.content}
                    </div>

                    <div className="group gap-2 flex items-center relative top-[-12px] right-0">
                        <MessageContent message={message} isOwnMessage={isOwnMessage} />
                        <MessageActions message={message} isOwnMessage={isOwnMessage} />
                    </div>
                </div>
            ) : (
                <div
                    className={`relative z-1 group flex items-center gap-2 ${isReaction && "top-2"} ${
                        isOwnMessage ? "justify-end" : "justify-start"
                    }`}
                >
                    <MessageContent message={message} isOwnMessage={isOwnMessage} />
                    <MessageActions message={message} isOwnMessage={isOwnMessage} />
                </div>
            )}
            {isReaction && (
                <div className={`relative z-10 ${isOwnMessage ? "text-right left-0" : "text-left right-0"}`}>
                    <div className="inline-block bg-content2 m-0 text-tiny py-[2px] px-1 border-2 border-background rounded-xl">
                        <EmojiReactionsLabel reactions={message?.reactions} message={message} />
                    </div>
                </div>
            )}
        </motion.div>
    );
}
