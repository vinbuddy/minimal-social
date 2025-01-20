import { useEffect, useMemo, useState } from "react";

import { useAuthStore } from "./store";
import { IConversation } from "@/types/conversation";

const useOtherUserConversation = (conversation: IConversation | undefined) => {
    const { currentUser } = useAuthStore();

    const otherUser = useMemo(() => {
        if (!currentUser || !conversation) return undefined;

        return conversation.participants?.find((participant) => participant._id !== currentUser._id);
    }, [currentUser, conversation]);

    return otherUser;
};

export default useOtherUserConversation;
