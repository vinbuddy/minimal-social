import { createContext, useContext } from "react";
import { IConversation } from "@/types/conversation";

type ConversationContextType = {
    onBack: () => void;
    conversationItem: IConversation | null;
};

export const ConversationContext = createContext<ConversationContextType>({
    onBack: () => {},
    conversationItem: null,
});

export const useConversationContext = () => useContext(ConversationContext);
