"use client";
import { IMessage } from "@/types/message";
import MessageContent from "./MessageContent";
import EmojiReactionsLabel from "./EmojiReactionsLabel";
import MessageActions from "./MessageActions";

interface IProps {
    message: IMessage;
    isOwnMessage: boolean;
}

export default function MessageItemReplied({ message, isOwnMessage }: IProps) {
    return (
        <div key={message?._id}>
            {message?.replyTo ? (
                <div
                    className={`relative top-5 flex flex-col !text-sm rounded-[18px] ${
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
                    className={`relative top-2 z-1 group flex items-center gap-2 ${
                        isOwnMessage ? "justify-end" : "justify-start"
                    }`}
                >
                    <MessageContent message={message} isOwnMessage={isOwnMessage} />
                    <MessageActions message={message} isOwnMessage={isOwnMessage} />
                </div>
            )}
            <div className={`relative z-10 ${isOwnMessage ? "text-right left-0" : "text-left right-0"}`}>
                <div className="inline-block bg-content2 m-0 text-tiny py-[2px] px-1 border-2 border-background rounded-xl">
                    <EmojiReactionsLabel />
                </div>
            </div>
        </div>
    );
}
