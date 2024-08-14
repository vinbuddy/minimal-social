import { IMessageReaction } from "@/types/message";

interface IProps {
    reactions: IMessageReaction[];
}

export default function EmojiReactionsLabel({ reactions }: IProps) {
    const recentReactions = reactions.slice(-2);
    const remainingReactionsCount = reactions.length - recentReactions.length;

    return (
        <div>
            {recentReactions.map((reaction) => (
                <span key={reaction.user._id}>{reaction.emoji}</span>
            ))}
            {remainingReactionsCount > 0 && <span>+{remainingReactionsCount}</span>}
        </div>
    );
}
