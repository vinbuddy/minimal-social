import { useMemo } from "react";

import { useAuthStore } from "./store";
import { IConversation } from "@/types/conversation";
import useOtherUserConversation from "./use-other-user-conversation";
import { IUser } from "@/types/user";

interface IProps {
    conversation?: IConversation;
    otherUser?: IUser;
}

const useIsBlockMode = ({ otherUser: defaultOtherUser, conversation }: IProps) => {
    const { currentUser } = useAuthStore();
    const otherUserFromConversation = useOtherUserConversation(conversation);
    const otherUser = defaultOtherUser ? defaultOtherUser : otherUserFromConversation;

    return useMemo(() => {
        if (!otherUser || !currentUser) return false;

        let _otherUser: IUser | undefined = otherUser;

        if (conversation) {
            _otherUser = conversation?.participants?.find((user) => user._id !== currentUser._id);
        }

        const isOtherUserBlocked = currentUser?.blockedUsers?.find((user) => user._id === otherUser._id);

        const isCurrentUserBlocked = _otherUser?.blockedUsers?.find((user) => user._id === currentUser._id);

        if (isOtherUserBlocked || isCurrentUserBlocked) {
            return true;
        }

        return false;
    }, [otherUser, currentUser, conversation]);
};

export default useIsBlockMode;
