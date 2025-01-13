"use client";
import { Button, Chip, Spinner } from "@nextui-org/react";
import { Fragment, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import useSWR from "swr";
import cn from "classnames";

import MessageItem from "./message-item";
import ErrorMessage from "../error-message";

import { IConversation } from "@/types/conversation";
import { IMessage } from "@/types/message";
import { useSocketContext } from "@/contexts/socket-context";
import { useGlobalMutation, useLoading } from "@/hooks";
import { useAuthStore, useMessagesStore } from "@/hooks/store";
import axiosInstance from "@/utils/httpRequest";
import { showToast } from "@/utils/toast";
import { formatDate } from "@/utils/datetime";
import ScrollToBottom from "../scroll-to-bottom";
import { ArrowDownIcon } from "lucide-react";

interface IProps {
    conversation: IConversation;
}

interface GroupedMessage {
    messages: IMessage[];
    marginBottom: string;
    date: string;
    showDate: boolean;
}

export default function MessageList({ conversation }: IProps) {
    let timeoutId: NodeJS.Timeout;
    const messageListRef = useRef<HTMLDivElement>(null);
    const { socket } = useSocketContext();
    const swrMutate = useGlobalMutation();
    const { currentUser } = useAuthStore();
    const mutation = useGlobalMutation();

    const [direction, setDirection] = useState<"next" | "prev" | "both" | "init">("init");
    const [messageCursorId, setMessageCursorId] = useState<string | null>(null);
    const [isAtBottom, setIsAtBottom] = useState<boolean>(true);

    const { loading: bothLoading, startLoading, stopLoading } = useLoading();

    const { messageList, messageIdReferenced, setMessageIdReferenced, setMessageList } = useMessagesStore();

    const { data, error, isLoading } = useSWR<{ data: IMessage[]; hasNextPage: boolean; hasPrevPage: boolean }>(
        `/message/cursor-pagination?conversationId=${conversation._id}&direction=${direction}&messageId=${messageCursorId}`
    );

    useEffect(() => {
        if (!data) return;

        const messages = data?.data || [];
        const sortedMessages = [...messageList, ...messages].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const messageListEl = messageListRef.current;
        if (!messageListEl) return;

        if (direction === "init") {
            setMessageList(messages);
        }

        if (direction === "next") {
            setMessageList(sortedMessages);
        }

        if (direction === "prev") {
            const previousHeight = messageListEl.scrollHeight;

            setMessageList(sortedMessages);

            requestAnimationFrame(() => {
                const newHeight = messageListEl.scrollHeight;
                messageListEl.scrollTop += newHeight - previousHeight;
            });
        }
    }, [data, direction, setMessageList]);

    useEffect(() => {
        if (!socket) {
            console.error("Socket is not defined");
            return;
        }

        const handleNewMessage = async (newMessage: IMessage) => {
            if (newMessage?.conversation?._id !== conversation._id) return;

            useMessagesStore.setState((state) => {
                const updatedMessageIndex = state.messageList.findIndex((message) => message._id === newMessage._id);

                if (updatedMessageIndex === -1) {
                    state.messageList.push(newMessage);
                } else {
                    state.messageList[updatedMessageIndex] = newMessage;
                }

                const sortedMessageList = [...state.messageList].sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );

                return { messageList: sortedMessageList };
            });

            // Scroll to bottom when a new message is added
            requestAnimationFrame(() => {
                if (messageListRef.current) {
                    messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
                }
            });

            swrMutate((key) => typeof key === "string" && key.includes("/conversation"));

            if (!currentUser) return;

            if (newMessage?.sender?._id !== currentUser._id) {
                const sound = new Audio(
                    "https://res.cloudinary.com/dtbhvc4p4/video/upload/v1723186867/audios/message-sound_eoo8ei.mp3"
                );
                // sound.play().catch((error) => console.log("Error playing sound:", error));
            }

            // Mark the new message as seen if the user is in the current conversation
            if (newMessage?.conversation?._id === conversation._id) {
                (async () => {
                    try {
                        // Call API to mark as seen
                        const res = await axiosInstance.post(`/message/mark-seen`, {
                            conversationId: conversation._id,
                            userId: currentUser._id,
                        });

                        mutation((key) => typeof key === "string" && key.includes("/conversation"));

                        // showToast("Marked as seen 2", "success");
                    } catch (error: any) {
                        showToast(error.message, "error");
                    }
                })();
            }
        };

        const handleReactMessage = (updatedMessage: IMessage) => {
            if (updatedMessage?.conversation?._id !== conversation._id) return;
            // Update message in the store
            useMessagesStore.setState((state) => {
                const updatedMessageIndex = state.messageList.findIndex(
                    (message) => message._id === updatedMessage._id
                );
                if (updatedMessageIndex === -1) return state;

                state.messageList[updatedMessageIndex] = updatedMessage;
                return { ...state };
            });
        };

        const handleRetractMessage = (updatedMessage: IMessage) => {
            if (updatedMessage?.conversation?._id !== conversation._id) return;

            // Update message in the store
            useMessagesStore.setState((state) => {
                const updatedMessageIndex = state.messageList.findIndex(
                    (message) => message._id === updatedMessage._id
                );
                if (updatedMessageIndex === -1) return state;

                state.messageList[updatedMessageIndex] = updatedMessage;
                return { ...state };
            });
        };

        const handleMarkMessageAsSeen = (lastMessageSeen: IMessage) => {
            if (lastMessageSeen.conversation?._id !== conversation._id) return;

            setTimeout(() => {
                // Update message in the store using filter
                useMessagesStore.setState((state) => {
                    const updatedMessageList = state.messageList.map((message) => {
                        if (message._id === lastMessageSeen._id) {
                            return { ...message, ...lastMessageSeen };
                        }
                        return message;
                    });

                    return { messageList: updatedMessageList };
                });
            }, 1000);
        };

        socket.on("reactMessage", handleReactMessage);
        socket.on("newMessage", handleNewMessage);
        socket.on("unreactMessage", handleReactMessage);
        socket.on("retractMessage", handleRetractMessage);
        socket.on("markMessageAsSeen", handleMarkMessageAsSeen);

        return () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("reactMessage", handleReactMessage);
            socket.off("unreactMessage", handleReactMessage);
            socket.off("retractMessage", handleRetractMessage);
            socket.off("markMessageAsSeen", handleMarkMessageAsSeen);
        };
    }, [socket, currentUser]);

    // Mark seen after mounting
    useEffect(() => {
        if (!conversation?._id || !messageList?.length || !currentUser) return;

        const unseenMessages = messageList.filter(
            (message) => !message.seenBy.some((user) => user._id === currentUser._id)
        );

        if (unseenMessages.length === 0) return;

        (async () => {
            try {
                // Call API to mark as seen
                await axiosInstance.post(`/message/mark-seen`, {
                    conversationId: conversation._id,
                    userId: currentUser._id,
                });

                mutation((key) => typeof key === "string" && key.includes("/conversation"));

                // showToast("Marked as seen 1", "success");
            } catch (error: any) {
                showToast(error.message, "error");
            }
        })();
    }, [conversation, messageList, currentUser, mutation]);

    useEffect(() => {
        if (!messageIdReferenced || !conversation) return;

        startLoading();

        (async () => {
            try {
                const res = await axiosInstance.get("/message/cursor-pagination", {
                    params: {
                        conversationId: conversation._id,
                        messageId: messageIdReferenced,
                        direction: "both",
                    },
                });
                const messages = res.data.data;
                setMessageList(messages);
            } catch (error: any) {
                showToast(error.message + " --- ", "error");
            } finally {
                stopLoading();
            }
        })();

        return () => {
            // setMessageIdReferenced("");
        };
    }, [messageIdReferenced, conversation, setMessageList, setMessageIdReferenced]);

    const sortMessagesByTime = (messages: IMessage[]): IMessage[] => {
        return messages.slice().sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    };

    const loadMoreMessages = async () => {
        try {
            if (!messageListRef.current) return;
            if (isLoading) return;

            const { scrollTop, scrollHeight, clientHeight } = messageListRef.current;

            const isReachTop = scrollTop < 50;
            const isReachBottom = scrollHeight - scrollTop - clientHeight < 50;

            const previousScrollTop = messageListRef.current.scrollTop;
            const previousScrollHeight = messageListRef.current.scrollHeight;

            if (isReachBottom && data?.hasNextPage) {
                setDirection("next");
                setMessageCursorId(messageList[0]._id);
            }

            if (isReachTop && data?.hasPrevPage) {
                setDirection("prev");
                setMessageCursorId(messageList[messageList.length - 1]._id);
            }

            requestAnimationFrame(() => {
                if (!messageListRef.current) return;

                if (direction === "next") {
                    messageListRef.current.scrollTop = previousScrollTop;
                }
            });
        } catch (error: any) {
            showToast(error.message, "error");
        }
    };

    const handleScroll = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            loadMoreMessages();

            if (messageListRef.current && direction !== "init") {
                const { scrollTop, scrollHeight, clientHeight } = messageListRef.current;
                setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 100 || scrollHeight < clientHeight);
            }
        }, 500);
    };

    const groupMessages = (): GroupedMessage[] => {
        const sortedMessages = sortMessagesByTime(messageList);
        const groupedMessages: GroupedMessage[] = [];
        let group: IMessage[] = [];
        let lastGroupTime = 0;
        let marginBottom = "mb-2"; // Default margin
        let currentDate: string | null = null;
        let lastShownDate: string | null = null;

        for (let i = 0; i < sortedMessages.length; i++) {
            const currentMessage = sortedMessages[i];
            const previousMessage = sortedMessages[i - 1];
            const messageDate = dayjs(currentMessage.createdAt).startOf("day").toISOString();

            if (!currentDate || !dayjs(messageDate).isSame(dayjs(currentDate), "day")) {
                if (group.length > 0) {
                    // Chỉ hiển thị date nếu khác với date cuối cùng đã hiển thị
                    const showDate = !lastShownDate || !dayjs(currentDate).isSame(dayjs(lastShownDate), "day");

                    groupedMessages.push({
                        messages: group,
                        marginBottom: marginBottom,
                        date: currentDate || messageDate,
                        showDate: showDate,
                    });

                    if (showDate) {
                        lastShownDate = currentDate || messageDate;
                    }
                }
                currentDate = messageDate;
                group = [];
            }

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
                    const showDate = !lastShownDate || !dayjs(currentDate).isSame(dayjs(lastShownDate), "day");

                    groupedMessages.push({
                        messages: group,
                        marginBottom: marginBottom,
                        date: currentDate,
                        showDate: showDate,
                    });

                    if (showDate) {
                        lastShownDate = currentDate;
                    }
                }
                group = [currentMessage];
            }

            lastGroupTime = currentMessageTime;
        }

        if (group.length > 0) {
            const showDate = !lastShownDate || !dayjs(currentDate).isSame(dayjs(lastShownDate), "day");

            groupedMessages.push({
                messages: group,
                marginBottom,
                date: currentDate as string,
                showDate: showDate,
            });
        }

        return groupedMessages;
    };

    const handleBackToBottom = () => {
        setDirection("init");
        setMessageCursorId(null);
        setIsAtBottom(true);
    };

    const groupedMessages = groupMessages();

    if (error) {
        return <ErrorMessage error={error} className="text-center" />;
    }

    return (
        <>
            <div
                ref={messageListRef}
                onScroll={handleScroll}
                className="w-full overflow-y-auto overflow-x-hidden h-full px-4 pt-4 scrollbar"
            >
                {isLoading && direction === "init" && (
                    <div className="h-full flex justify-center items-center">
                        <Spinner size="md" />
                    </div>
                )}
                {bothLoading && (
                    <div className="h-full flex justify-center items-center">
                        <Spinner size="md" />
                    </div>
                )}

                <div>
                    {isLoading && direction == "prev" && (
                        <>
                            <div className="flex justify-center items-start overflow-hidden">
                                <Spinner size="md" />
                            </div>
                        </>
                    )}

                    {groupedMessages.map((group, index) => (
                        <Fragment key={index}>
                            {group.showDate && (
                                <div className="flex justify-center my-4">
                                    <Chip color="default" size="sm" variant="flat">
                                        {formatDate(group.date)}
                                    </Chip>
                                </div>
                            )}
                            <MessageItem
                                originalMessages={messageList}
                                messages={group.messages}
                                className={`${group.marginBottom}`}
                                conversation={conversation}
                            />
                        </Fragment>
                    ))}

                    {isLoading && direction == "next" && (
                        <>
                            <div className="flex justify-center items-start overflow-hidden">
                                <Spinner size="md" />
                            </div>
                        </>
                    )}

                    {direction === "init" && messageList.length > 0 && <ScrollToBottom />}
                </div>
            </div>
            {/* Float button - Scroll to bottom */}
            <div className="relative">
                <div
                    className={cn(
                        "absolute -top-12 left-1/2 transform -translate-x-1/2 animate-[fadeIn_0.2s_ease-in] fade",
                        {
                            "invisible pointer-events-none": isAtBottom && direction === "init",
                            "visible pointer-events-auto show": !isAtBottom,
                        }
                    )}
                >
                    <Button isIconOnly variant="flat" radius="full" onClick={handleBackToBottom}>
                        <ArrowDownIcon />
                    </Button>
                </div>
            </div>
        </>
    );
}
