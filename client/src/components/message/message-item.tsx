import { Avatar } from "@nextui-org/react";

import MessageItemGroup from "./message-item-group";
import { useAuthStore } from "@/hooks/store";
import { IMessage } from "@/types/message";
import { IConversation } from "@/types/conversation";

interface IProps {
    className?: string;
    messages: IMessage[];
    originalMessages: IMessage[];
    conversation: IConversation;
}

export default function MessageItem({ className = "", messages, originalMessages, conversation }: IProps) {
    const { currentUser } = useAuthStore();
    const isOwnMessage = messages[0]?.sender?._id === currentUser?._id;

    const lastSeenMessage = [...originalMessages].reverse().find((message) => {
        return (
            message.seenBy.length > 0 && message.seenBy.some((user) => user._id !== currentUser?._id) // Người xem không phải currentUser
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
                        <>
                            <MessageItemGroup
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
                        </>
                    ))}
            </div>
        </div>
    );
}
