import { create } from "zustand";
import { IMessage } from "@/types/message";

interface UseMessagesState {
    messageList: IMessage[];
    isReferenceMessage: boolean;
    messageIdReferenced: string;
    setMessageList: (messages: IMessage[]) => void;
    clearMessageList: () => void;
    setIsReference: (isSearching: boolean) => void;
    setMessageIdReferenced: (messageId: string) => void;
}

const useMessagesStore = create<UseMessagesState>((set) => ({
    messageList: [],
    isReferenceMessage: false,
    messageIdReferenced: "",
    setMessageList: (messages) => {
        set({ messageList: messages });
    },
    clearMessageList: () => set({ messageList: [] }),
    setIsReference: (isReference) => set({ isReferenceMessage: isReference }),
    setMessageIdReferenced: (messageId) => set({ messageIdReferenced: messageId }),
}));

export default useMessagesStore;
