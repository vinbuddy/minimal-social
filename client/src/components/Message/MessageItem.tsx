import useAuthStore from "@/hooks/store/useAuthStore";
import { IMessage } from "@/types/message";
import { Avatar } from "@nextui-org/react";

import MessageItemGroup from "./MessageItemGroup";

interface IProps {
    className?: string;
    messages: IMessage[];
}

export default function MessageItem({ className = "", messages }: IProps) {
    const { currentUser } = useAuthStore();
    const isOwnMessage = messages[0]?.sender?._id === currentUser?._id;

    return (
        <div
            className={`flex items-end gap-3 w-fit max-w-[75%] ${
                isOwnMessage ? "ml-auto flex-row-reverse" : "justify-start"
            } ${className}`}
        >
            {!isOwnMessage && <Avatar src={messages[0]?.sender?.photo} alt="User" size="sm" />}
            <div className="flex-1 flex flex-col gap-1">
                {messages.length > 0 &&
                    messages?.map((message) => (
                        <MessageItemGroup key={message?._id} message={message} isOwnMessage={isOwnMessage} />
                    ))}
            </div>
        </div>
    );
}
