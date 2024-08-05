import useAuthStore from "@/hooks/store/useAuthStore";
import { IMessage } from "@/types/message";
import { Avatar, Button } from "@nextui-org/react";
import { EllipsisVerticalIcon, ReplyIcon, SmileIcon } from "lucide-react";
import { formatTimeStamp } from "@/utils/datetime";
import Image from "next/image";
import MediaFileSlider from "../Media/MediaFileSlider";

interface IProps {
    className?: string;
    messages: IMessage[];
}

export default function MessageItem({ className = "", messages }: IProps) {
    const { currentUser } = useAuthStore();
    const isOwnMessage = messages[0]?.sender?._id === currentUser?._id;

    const renderImageMessage = (message: IMessage) => {
        return (
            <section
                className={`[&_.swiper-slide]:first:!me-0 max-w-full overflow-hidden ${
                    isOwnMessage && message?.mediaFiles.length > 0 ? "order-2 " : "order-1"
                }`}
            >
                <MediaFileSlider
                    // onMediaFileClick={handleMediaFileClick}
                    mediaFiles={message?.mediaFiles ?? []}
                    videoPreview={true}
                    scrollHorizontally={false}
                />
            </section>
        );
    };

    const renderTextMessage = (message: IMessage) => {
        return (
            <section
                className={`text-[15px] rounded-[18px] px-3 py-2 
                                    ${
                                        isOwnMessage && message?.content
                                            ? "order-2 bg-primary text-primary-foreground"
                                            : "order-1 bg-content2"
                                    }`}
            >
                {/* Message */}
                <span>{message?.content}</span>
            </section>
        );
    };

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
                        <div
                            key={message?._id}
                            className={`group flex items-center gap-2 ${
                                isOwnMessage ? "justify-end" : "justify-start"
                            }`}
                        >
                            {/* <section
                                className={`text-[15px] rounded-[18px] px-3 py-2 
                                    ${
                                        isOwnMessage && message?.content
                                            ? "order-2 bg-primary text-primary-foreground"
                                            : "order-1 bg-content2"
                                    }`}
                            >
                                <span>{message?.content}</span>
                            </section> */}
                            {message?.content && renderTextMessage(message)}
                            {message?.mediaFiles && renderImageMessage(message)}

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
