import { IMessageReaction } from "@/types/message";

interface IProps {
    reactions: IMessageReaction[];
}

export default function EmojiReactionsLabel({ reactions }: IProps) {
    return (
        <div>
            {reactions.map((reaction) => (
                <span key={reaction.user._id}>{reaction.emoji}</span>
            ))}
        </div>
    );
}
