import useAuthStore from "@/hooks/store/useAuthStore";
import { IMessage } from "@/types/message";
import { Avatar, Button } from "@nextui-org/react";
import { EllipsisVerticalIcon, ReplyIcon, SmileIcon } from "lucide-react";
import TimeAgo from "../TimeAgo";
import { formatTimeStamp } from "@/utils/datetime";

interface IProps {
    className?: string;
    messages: IMessage[];
}

export default function MessageItem({ className = "", messages }: IProps) {
    const { currentUser } = useAuthStore();
    const isOwnMessage = messages[0]?.sender?._id === currentUser?._id;

    return (
        <div
            className={`flex items-end gap-3 w-fit max-w-[70%] ${
                isOwnMessage ? "ml-auto flex-row-reverse" : "justify-start"
            } ${className}`}
        >
            {!isOwnMessage && <Avatar src={messages[0]?.sender?.photo} alt="User" size="sm" />}

            <div className="flex-1 flex flex-col gap-1">
                {/* Messages groups */}
                {messages.length > 0 &&
                    messages?.map((message) => (
                        <div key={message?._id} className="group flex items-center gap-2">
                            <section
                                className={`bg-content2 text-[15px] rounded-[18px] px-3 py-2 ${
                                    isOwnMessage ? "order-2" : "order-1"
                                }`}
                            >
                                {/* Message */}
                                {message?.content}
                            </section>
                            <section
                                className={`flex items-center flex-nowrap invisible group-hover:visible ${
                                    isOwnMessage ? "order-1" : "order-2"
                                }`}
                            >
                                <Button isIconOnly size="sm" radius="full" color="default" variant="light">
                                    <SmileIcon size={16} className="text-default-400" />
                                </Button>
                                <Button isIconOnly size="sm" radius="full" color="default" variant="light">
                                    <ReplyIcon size={16} className="text-default-400" />
                                </Button>
                                <Button isIconOnly size="sm" radius="full" color="default" variant="light">
                                    <EllipsisVerticalIcon size={16} className="text-default-400" />
                                </Button>
                                <p className={`text-default-500 text-tiny`}>{formatTimeStamp(message?.createdAt)}</p>
                            </section>
                        </div>
                    ))}
            </div>
        </div>
    );
}
