import { IComment } from "@/types/comment";
import { IMessage } from "@/types/message";
import { create } from "zustand";

interface UseReplyState {
    replyTo: any;
    reply: (data: any) => void;
    unReply: () => void;
}

const useReplyStore = create<UseReplyState>((set) => ({
    replyTo: null,
    reply: (data) => {
        console.log(data);

        return set({ replyTo: data });
    },
    unReply: () => set({ replyTo: null }),
}));

export default useReplyStore;
