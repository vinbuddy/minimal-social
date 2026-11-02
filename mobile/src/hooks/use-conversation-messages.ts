import { useCallback, useEffect, useRef, useState } from "react";

import { invalidate } from "@/lib/invalidate";
import { connectSocket } from "@/lib/socket";
import { getMessages, markConversationSeen, MessagePage } from "@/services/chat";
import { conversationIdOf, IMessage } from "@/types/chat";

const byNewest = (a: IMessage, b: IMessage) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

/**
 * A conversation's messages, newest first (the order an inverted list wants): the latest page, older pages on
 * demand, live updates from the socket. With `aroundMessageId` (a search result) it opens on the messages around
 * that one instead, until `loadLatest`.
 */
export function useConversationMessages(conversationId: string, currentUserId: string | undefined, aroundMessageId?: string) {
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingOlder, setIsLoadingOlder] = useState(false);
    const [hasOlder, setHasOlder] = useState(false);
    const [error, setError] = useState<unknown>(null);
    /** Set while showing the messages around a search result; the API can't page from there */
    const [jumpedTo, setJumpedTo] = useState<string | null>(null);
    const isFocusedRef = useRef(true);

    const upsert = useCallback((incoming: IMessage[]) => {
        setMessages((current) => {
            const byId = new Map(current.map((message) => [message._id, message]));
            incoming.forEach((message) => byId.set(message._id, message));
            return [...byId.values()].sort(byNewest);
        });
    }, []);

    const markSeen = useCallback(() => {
        markConversationSeen(conversationId)
            .then(() => invalidate("/conversation"))
            .catch(() => {});
    }, [conversationId]);

    const showLatest = useCallback(
        (page: MessagePage) => {
            setMessages(page.data.sort(byNewest));
            // `init` doesn't say whether older pages exist; a full page means there may be
            setHasOlder(page.data.length >= 20);
            setJumpedTo(null);
            markSeen();
        },
        [markSeen],
    );

    const loadLatest = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            showLatest(await getMessages(conversationId, "init"));
        } catch (loadError) {
            setError(loadError);
        } finally {
            setIsLoading(false);
        }
    }, [conversationId, showLatest]);

    // First load (`isLoading` starts true), and again when a search result is picked
    useEffect(() => {
        let isCancelled = false;
        const load = aroundMessageId ? getMessages(conversationId, "both", aroundMessageId) : getMessages(conversationId, "init");
        load.then((page) => {
            if (isCancelled) return;
            if (!aroundMessageId) return showLatest(page);
            setMessages(page.data.sort(byNewest));
            setHasOlder(false);
            setJumpedTo(aroundMessageId);
        })
            .catch((loadError) => !isCancelled && setError(loadError))
            .finally(() => !isCancelled && setIsLoading(false));
        return () => {
            isCancelled = true;
        };
    }, [conversationId, aroundMessageId, showLatest]);

    const loadOlder = useCallback(async () => {
        const oldest = messages[messages.length - 1];
        if (!oldest || !hasOlder || isLoadingOlder || jumpedTo) return;

        setIsLoadingOlder(true);
        try {
            const page = await getMessages(conversationId, "prev", oldest._id);
            upsert(page.data);
            setHasOlder(page.hasPrevPage);
        } catch {
            // Scrolling up again retries
        } finally {
            setIsLoadingOlder(false);
        }
    }, [messages, hasOlder, isLoadingOlder, jumpedTo, conversationId, upsert]);

    // Live updates. Every event is sent to the conversation's room, the sender included
    useEffect(() => {
        const socket = connectSocket();
        // Rejoin rooms: a conversation created after the last `online` has no room yet on this socket
        socket.emit("online");

        const belongsHere = (message: IMessage | null): message is IMessage => !!message && conversationIdOf(message) === conversationId;

        const onNewMessage = (message: IMessage) => {
            if (!belongsHere(message)) return;
            upsert([message]);
            if (message.sender._id !== currentUserId && isFocusedRef.current) markSeen();
        };
        const onChanged = (message: IMessage | null) => {
            if (belongsHere(message)) upsert([message]);
        };

        socket.on("newMessage", onNewMessage);
        socket.on("reactMessage", onChanged);
        socket.on("unreactMessage", onChanged);
        socket.on("retractMessage", onChanged);
        socket.on("markMessageAsSeen", onChanged);

        return () => {
            socket.off("newMessage", onNewMessage);
            socket.off("reactMessage", onChanged);
            socket.off("unreactMessage", onChanged);
            socket.off("retractMessage", onChanged);
            socket.off("markMessageAsSeen", onChanged);
        };
    }, [conversationId, currentUserId, upsert, markSeen]);

    return {
        messages,
        isLoading,
        isLoadingOlder,
        hasOlder,
        error,
        jumpedTo,
        isFocusedRef,
        upsert,
        remove: (messageId: string) => setMessages((current) => current.filter((message) => message._id !== messageId)),
        loadOlder,
        loadLatest,
    };
}
