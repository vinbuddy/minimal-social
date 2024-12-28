import { Avatar } from "@nextui-org/react";

import MessageItemGroup from "./message-item-group";
import { useAuthStore } from "@/hooks/store";
import { IMessage } from "@/types/message";

interface IProps {
    className?: string;
    messages: IMessage[];
}

export default function MessageItem({ className = "", messages }: IProps) {
    const { currentUser } = useAuthStore();
    const isOwnMessage = messages[0]?.sender?._id === currentUser?._id;

    const getLastSeenPositions = () => {
        const positions: Record<string, number> = {};

        [...messages].reverse().forEach((message, reverseIndex) => {
            message.seenBy?.forEach((user) => {
                const userId = user._id;
                const originalIndex = messages.length - 1 - reverseIndex;

                if (!positions[userId] && userId !== currentUser?._id && isOwnMessage) {
                    positions[userId] = originalIndex;
                }
            });
        });

        return positions;
    };

    const lastSeenPositions = getLastSeenPositions();

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
                            <MessageItemGroup key={message?._id} message={message} isOwnMessage={isOwnMessage} />

                            <div className="flex items-center gap-2 justify-end">
                                {message.seenBy
                                    ?.filter(
                                        (user) => lastSeenPositions[user._id] === index && user._id !== currentUser?._id
                                    )
                                    .map((user) => (
                                        <Avatar
                                            className="!size-4"
                                            key={user._id}
                                            src={user.photo}
                                            alt={user.username}
                                        />
                                    ))}
                                {/* {message.seenBy
                                    .filter(
                                        (user) => lastSeenPositions[user._id] === index && user._id !== currentUser?._id
                                    )
                                    .map((user) => (
                                        <Avatar
                                            className="!size-4"
                                            key={user._id}
                                            src={user.photo}
                                            alt={user.username}
                                        />
                                    ))} */}
                            </div>
                        </>
                    ))}
            </div>
        </div>
    );
}
