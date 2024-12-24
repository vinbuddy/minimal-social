import { create } from "zustand";
import { IMessage } from "@/types/message";

interface UseMessagesState {
    messageList: IMessage[];
    setMessageList: (messages: IMessage[]) => void;
    clearMessageList: () => void;
}

const useMessagesStore = create<UseMessagesState>((set) => ({
    messageList: [],
    setMessageList: (messages) => {
        set({ messageList: messages });
    },
    clearMessageList: () => set({ messageList: [] }),
}));

export default useMessagesStore;
