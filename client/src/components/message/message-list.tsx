"use client";
import { Spinner } from "@nextui-org/react";
import { Fragment, use, useEffect, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import MessageItem from "./message-item";

import { IConversation } from "@/types/conversation";
import { IMessage } from "@/types/message";
import { useSocketContext } from "@/contexts/socket-context";
import { usePagination, useGlobalMutation } from "@/hooks";
import { useAuthStore, useMessagesStore } from "@/hooks/store";

interface IProps {
    conversation: IConversation;
}

interface GroupedMessage {
    messages: IMessage[];
    marginBottom: string;
}

export default function MessageList({ conversation }: IProps) {
    const messageListRef = useRef<HTMLDivElement>(null);
    const { socket } = useSocketContext();
    const swrMutate = useGlobalMutation();
    const { currentUser } = useAuthStore();

    const { messageList, setMessageList } = useMessagesStore();

    const {
        data: messages,
        loadingMore,
        error,
        isReachedEnd,
        size,
        isLoading,
        setSize: setPage,
        mutate,
    } = usePagination<IMessage>(`/message?conversationId=${conversation._id}`);

    useEffect(() => {
        if (messages) {
            setMessageList(messages);
        }
    }, [loadingMore]);

    useEffect(() => {
        if (!socket) {
            console.error("Socket is not defined");
            return;
        }

        const handleNewMessage = (newMessage: IMessage) => {
            // Update message in the store
            useMessagesStore.setState((state) => {
                const updatedMessageIndex = state.messageList.findIndex((message) => message._id === newMessage._id);
                if (updatedMessageIndex === -1) {
                    state.messageList.push(newMessage);
                }
                return { ...state };
            });

            // Scroll to bottom when a new message is added
            if (messageListRef.current) {
                messageListRef.current.scrollTo({ top: 0, behavior: "smooth" });
            }

            mutate((currentData) => {
                if (!currentData) return [{ data: [newMessage] }];

                // remove duplicate message
                const isDuplicate = currentData.some((page) =>
                    page.data.some((message: any) => message._id === newMessage._id)
                );

                if (isDuplicate) return currentData;

                const updatedData = currentData.map((page) => ({
                    ...page,
                    data: [newMessage, ...page.data],
                }));

                return updatedData;
            }, false);

            swrMutate((key) => typeof key === "string" && key.includes("/conversation"));

            if (!currentUser) return;

            if (newMessage?.sender?._id !== currentUser._id) {
                const sound = new Audio(
                    "https://res.cloudinary.com/dtbhvc4p4/video/upload/v1723186867/audios/message-sound_eoo8ei.mp3"
                );
                sound.play().catch((error) => console.log("Error playing sound:", error));
            }
        };

        const handleReactMessage = (updatedMessage: IMessage) => {
            // Update message in the store
            useMessagesStore.setState((state) => {
                const updatedMessageIndex = state.messageList.findIndex(
                    (message) => message._id === updatedMessage._id
                );
                if (updatedMessageIndex === -1) return state;

                state.messageList[updatedMessageIndex] = updatedMessage;
                return { ...state };
            });

            mutate((currentData) => {
                if (!currentData) return;

                const updatedData = currentData.map((page) => ({
                    ...page,
                    data: page.data.map((message: IMessage) =>
                        message._id === updatedMessage._id ? updatedMessage : message
                    ),
                }));

                return updatedData;
            }, false);
        };

        const handleRetractMessage = (updatedMessage: IMessage) => {
            // Update message in the store
            useMessagesStore.setState((state) => {
                const updatedMessageIndex = state.messageList.findIndex(
                    (message) => message._id === updatedMessage._id
                );
                if (updatedMessageIndex === -1) return state;

                state.messageList[updatedMessageIndex] = updatedMessage;
                return { ...state };
            });

            mutate((currentData) => {
                if (!currentData) return;

                const updatedData = currentData.map((page) => ({
                    ...page,
                    data: page.data.map((message: IMessage) =>
                        message._id === updatedMessage._id ? updatedMessage : message
                    ),
                }));

                return updatedData;
            }, false);
        };

        socket.on("reactMessage", handleReactMessage);
        socket.on("newMessage", handleNewMessage);
        socket.on("unreactMessage", handleReactMessage);
        socket.on("retractMessage", handleRetractMessage);

        return () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("reactMessage", handleReactMessage);
            socket.off("unreactMessage", handleReactMessage);
            socket.off("retractMessage", handleRetractMessage);
        };
    }, [socket, currentUser]);

    const sortMessagesByTime = (messages: IMessage[]): IMessage[] => {
        return messages.slice().sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    };

    const groupMessages = (messages: IMessage[]): GroupedMessage[] => {
        const sortedMessages = sortMessagesByTime(messages);
        const groupedMessages: GroupedMessage[] = [];
        let group: IMessage[] = [];
        let lastGroupTime = 0;
        let marginBottom = "mb-2"; // Default margin

        for (let i = 0; i < sortedMessages.length; i++) {
            const currentMessage = sortedMessages[i];
            const previousMessage = sortedMessages[i - 1];

            const isSameSender = previousMessage ? currentMessage.sender._id === previousMessage.sender._id : false;
            const currentMessageTime = new Date(currentMessage.createdAt).getTime();
            const previousMessageTime = previousMessage ? new Date(previousMessage.createdAt).getTime() : 0;
            const isWithinOneMinute = previousMessage ? currentMessageTime - previousMessageTime <= 60 * 1000 : true;

            const timeDifference = lastGroupTime ? currentMessageTime - lastGroupTime : 0;

            if (timeDifference > 5 * 60 * 1000) {
                // Greater than 5 minutes
                marginBottom = "mb-4";
            } else if (timeDifference > 1 * 60 * 1000) {
                // Greater than 1 minute
                marginBottom = "mb-3";
            }

            if (i > 0 && isSameSender && isWithinOneMinute) {
                group.push(currentMessage);
            } else {
                if (group.length > 0) {
                    groupedMessages.push({ messages: group, marginBottom: marginBottom });
                }
                group = [currentMessage];
            }

            lastGroupTime = currentMessageTime;
        }

        if (group.length > 0) {
            groupedMessages.push({ messages: group, marginBottom });
        }

        return groupedMessages;
    };

    const groupedMessages = groupMessages(messageList);

    if (error) {
        if (error.response.status === 403) {
            return <div className="text-center text-red-500">You are not allowed to access this conversation.</div>;
        }

        if (error.response.status === 404) {
            return <div className="text-center text-red-500">Conversation not found.</div>;
        }

        return <div className="text-center text-red-500">An unexpected error occurred.</div>;
    }

    return (
        <>
            <div
                ref={messageListRef}
                id="messageList"
                style={{
                    height: "100%",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column-reverse",
                }}
                className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col p-4 scrollbar"
            >
                {error && !isLoading && <p className="text-center text-danger">{error?.message}</p>}
                {isLoading && (
                    <div className="h-full flex justify-center items-center">
                        <Spinner size="md" />
                    </div>
                )}
                {!error && messageList.length > 0 && (
                    <InfiniteScroll
                        scrollThreshold={0.7}
                        scrollableTarget="messageList"
                        inverse={true}
                        style={{ display: "flex", flexDirection: "column-reverse" }}
                        next={() => setPage(size + 1)}
                        hasMore={!isReachedEnd}
                        loader={
                            <div className="flex justify-center items-start overflow-hidden">
                                <Spinner size="md" />
                            </div>
                        }
                        endMessage={<p className="text-center text-default-500">You have seen it all</p>}
                        dataLength={messageList?.length ?? 0}
                    >
                        {/*  Add h-[100px] to avoid being hidden scrollbar */}

                        <div>
                            {groupedMessages.map((group, index) => (
                                <Fragment key={index}>
                                    <MessageItem messages={group.messages} className={`${group.marginBottom}`} />
                                </Fragment>
                            ))}
                        </div>
                        <div className="h-[100px]"></div>
                    </InfiniteScroll>
                )}
            </div>
        </>
    );
}
