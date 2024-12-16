import { createContext, useContext } from "react";

export const ConversationContext = createContext({
    onBack: () => {},
});
export const useConversationContext = () => useContext(ConversationContext);
