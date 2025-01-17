import { Avatar } from "@heroui/react";

import MessageItemGroup from "./message-item-group";
import { useAuthStore, useMessagesStore } from "@/hooks/store";
import { IMessage } from "@/types/message";
import { IConversation } from "@/types/conversation";
import { forwardRef, Fragment, Ref, useEffect, useRef } from "react";

interface IProps {
    className?: string;
    messages: IMessage[];
    originalMessages: IMessage[];
    conversation: IConversation;
}

function MessageItem({ className = "", messages, originalMessages, conversation }: IProps, ref: Ref<HTMLDivElement>) {
    const { currentUser } = useAuthStore();
    const { messageIdReferenced } = useMessagesStore();
    const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    useEffect(() => {
        if (!messageIdReferenced && !messageRefs.current[messageIdReferenced]) {
            return;
        }

        // Delay scrolling to allow the message to be rendered first
        setTimeout(() => {
            messageRefs.current[messageIdReferenced]?.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "nearest",
            });
        }, 200);
    }, [messageIdReferenced]);

    const isOwnMessage = messages[0]?.sender?._id === currentUser?._id;

    const lastSeenMessage = [...originalMessages].reverse().find((message) => {
        return (
            // Người xem không phải currentUser
            message.seenBy.length > 0 && message.seenBy.some((user) => user._id !== currentUser?._id)
        );
    });

    return (
        <div
            className={`flex items-end gap-3 w-fit max-w-full md:max-w-[75%] ${
                isOwnMessage ? "ml-auto flex-row-reverse" : "justify-start"
            } ${className}`}
        >
            {!isOwnMessage && <Avatar src={messages[0]?.sender?.photo} alt="User" size="sm" />}
            <div className="flex-1 flex flex-col gap-1">
                {messages.length > 0 &&
                    messages?.map((message, index) => (
                        <Fragment key={message._id}>
                            <MessageItemGroup
                                ref={(el) => {
                                    messageRefs.current[message._id] = el;
                                }}
                                key={message?._id}
                                message={message}
                                isOwnMessage={isOwnMessage}
                                conversation={conversation}
                            />

                            <div className="flex items-center gap-2 justify-end">
                                {message.seenBy
                                    ?.filter(
                                        (user) =>
                                            user._id !== currentUser?._id &&
                                            lastSeenMessage?._id === message._id &&
                                            isOwnMessage
                                    )
                                    .map((user) => (
                                        <Avatar
                                            className="!size-4"
                                            key={user._id}
                                            src={user.photo}
                                            alt={user.username}
                                        />
                                    ))}
                            </div>
                        </Fragment>
                    ))}
            </div>
        </div>
    );
}

export default forwardRef<HTMLDivElement, IProps>(MessageItem);
