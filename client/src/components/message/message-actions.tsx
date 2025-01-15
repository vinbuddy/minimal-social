"use client";
import { Button, Chip } from "@nextui-org/react";
import { EllipsisVerticalIcon, ReplyIcon, SmileIcon } from "lucide-react";

import MessageEmojiReaction from "./message-emoji-reaction";
import MessageMenuDropdown from "./message-menu-dropdown";

import { IMessage } from "@/types/message";
import { formatTime } from "@/utils/datetime";
import axiosInstance from "@/utils/http-request";
import { showToast } from "@/utils/toast";
import { useAuthStore, useReplyStore } from "@/hooks/store";
import { useGlobalMutation } from "@/hooks";

interface IProps {
    message: IMessage;
    isOwnMessage: boolean;
}

export default function MessageActions({ message, isOwnMessage }: IProps) {
    const { reply } = useReplyStore();
    const { currentUser } = useAuthStore();
    const mutate = useGlobalMutation();

    const handleReactMessage = async (emoji: string) => {
        try {
            // Call the API to react to the message
            const res = await axiosInstance.post(`/message/reaction/${message._id}`, {
                userId: currentUser?._id,
                emoji,
                conversationId: message.conversation._id,
            });

            // Mutate message using swr
            mutate((key) => typeof key === "string" && key.includes("/message"));
        } catch (error) {
            console.log("ERROR REACT MESSAGE", error);
            showToast("React message failed", "error");
        }
    };

    if (message?.isRetracted) {
        return null;
    }

    return (
        <section
            className={`flex items-center flex-wrap invisible group-hover:visible ${
                isOwnMessage ? "order-1" : "order-2"
            }`}
        >
            <MessageEmojiReaction onAfterPicked={(emoji: string) => handleReactMessage(emoji)}>
                <Button isIconOnly size="sm" radius="full" color="default" variant="light">
                    <SmileIcon size={16} className="text-default-400" />
                </Button>
            </MessageEmojiReaction>
            <Button onPress={() => reply(message)} isIconOnly size="sm" radius="full" color="default" variant="light">
                <ReplyIcon size={16} className="text-default-400" />
            </Button>
            <MessageMenuDropdown message={message} isOwnMessage={isOwnMessage}>
                <Button isIconOnly size="sm" radius="full" color="default" variant="light">
                    <EllipsisVerticalIcon size={16} className="text-default-400" />
                </Button>
            </MessageMenuDropdown>
            {!message?.mediaFiles?.length && (
                <Chip size="sm" variant="flat" className={`px-1 text-default-500 text-tiny`}>
                    {formatTime(message?.createdAt)}
                </Chip>
            )}
        </section>
    );
}
