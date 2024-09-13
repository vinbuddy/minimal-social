import { IMessage, IMessageReaction } from "@/types/message";
import { XIcon } from "lucide-react";
import MessageReactionModal from "./MessageReactionModal";

interface IProps {
    reactions: IMessageReaction[];
    message?: IMessage;
}

export default function EmojiReactionsLabel({ reactions, message }: IProps) {
    const recentReactions = reactions.slice(-2);
    const remainingReactionsCount = reactions.length - recentReactions.length;

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

            <XIcon
                size={10}
                className="group-hover:opacity-100 group-hover:w-4 group-hover:h-4 group-hover:scale-100 group-hover:ms-1 opacity-0 w-0 h-0 transition-all duration-300 ease-in-out transform scale-0 text-default-500"
            />
        </div>
    );
}
