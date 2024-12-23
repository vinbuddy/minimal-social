"use client";

import { XIcon } from "lucide-react";
import { toast } from "sonner";

import MessageReactionModal from "./message-reaction-modal";
import { IMessage, IMessageReaction } from "@/types/message";
import axiosInstance from "@/utils/httpRequest";
import { showToast } from "@/utils/toast";
import { useAuthStore } from "@/hooks/store";

interface IProps {
    reactions: IMessageReaction[];
    message?: IMessage;
}

export default function EmojiReactionsLabel({ reactions, message }: IProps) {
    const { currentUser } = useAuthStore();

    const recentReactions = reactions.slice(-2);
    const remainingReactionsCount = reactions.length - recentReactions.length;

    // Check if the current user has reacted to the message

    const isReacted = reactions.some((reaction) => reaction.user._id === currentUser?._id);

    const handleUnreactMessage = async () => {
        try {
            await axiosInstance.post(`/message/unreaction/${message?._id}`, {
                userId: currentUser?._id,
                conversationId: message?.conversation._id,
            });
        } catch (error) {
            console.log("ERROR UNREACT MESSAGE", error);
            showToast("Unreact message failed", "error");
        }
    };

    return (
        <div className="group flex items-center cursor-pointer transition-all ease-in">
            <MessageReactionModal messageId={message?._id}>
                <div>
                    {recentReactions.map((reaction) => (
                        <span key={reaction.user._id}>{reaction.emoji}</span>
                    ))}
                    {remainingReactionsCount > 0 && <span>+{remainingReactionsCount}</span>}
                </div>
            </MessageReactionModal>

            {isReacted && (
                <XIcon
                    className="group-hover:opacity-100 group-hover:w-4 group-hover:h-4 group-hover:scale-100 group-hover:ms-1 opacity-0 w-0 h-0 transition-all duration-300 ease-in-out transform scale-0 text-default-500"
                    size={10}
                    onClick={handleUnreactMessage}
                />
            )}
        </div>
    );
}
