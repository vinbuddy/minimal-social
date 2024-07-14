import { IComment } from "@/types/comment";
import { create } from "zustand";

interface UseCommentState {
    replyTo: IComment | null;
    reply: (data: IComment) => void;
    unReply: () => void;
}

const useCommentStore = create<UseCommentState>((set) => ({
    replyTo: null,
    reply: (data) => set({ replyTo: data }),
    unReply: () => set({ replyTo: null }),
}));

export default useCommentStore;
