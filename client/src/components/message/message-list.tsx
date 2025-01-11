"use client";
import { Chip, Spinner } from "@nextui-org/react";
import { Fragment, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import useSWR from "swr";

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

    const { loading: bothLoading, startLoading, stopLoading } = useLoading();

    const { messageList, messageIdReferenced, setMessageIdReferenced, setMessageList } = useMessagesStore();

    const { data, error, isLoading } = useSWR<{ data: IMessage[]; nextCursor: string; prevCursor: string }>(
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

        if (direction === "next" || direction === "prev") {
            setMessageList(sortedMessages);
        }

        const observer = new MutationObserver(() => {
            const previousScrollHeight = messageListEl.scrollHeight;
            const currentScrollHeight = messageListEl.scrollHeight;

            // Điều chỉnh scrollTop để giữ vị trí cũ
            if (currentScrollHeight > previousScrollHeight) {
                messageListEl.scrollTop += currentScrollHeight - previousScrollHeight;
            }
        });

        observer.observe(messageListEl, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
        };
    }, [data, direction, setMessageList]);

    useEffect(() => {
        if (!socket) {
            console.error("Socket is not defined");
            return;
        }

        const handleNewMessage = async (newMessage: IMessage) => {
            if (newMessage?.conversation?._id !== conversation._id) return;

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

                // setDirection("both");
                // requestAnimationFrame(() => {
                //     requestAnimationFrame(() => {
                //         const messageListEl = messageListRef.current;
                //         if (!messageListEl) return;
                //         // Với column-reverse, scrollHeight đã bao gồm padding
                //         const scrollHeight = messageListEl.scrollHeight;
                //         const clientHeight = messageListEl.clientHeight;
                //         // Đặt scrollTop để tin nhắn nằm ở khoảng 40% từ dưới lên
                //         messageListEl.scrollTop = scrollHeight - clientHeight * 1.4;
                //     });
                // });
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

            if (isReachBottom) {
                setDirection("next");
                setMessageCursorId(messageList[0]._id);
            }

            if (isReachTop) {
                setDirection("prev");
                setMessageCursorId(messageList[messageList.length - 1]._id);
            }

            requestAnimationFrame(() => {
                if (!messageListRef.current) return;

                const newScrollHeight = messageListRef.current.scrollHeight;
                if (direction === "next") {
                    // Giữ nguyên vị trí scroll khi load next
                    messageListRef.current.scrollTop = previousScrollTop;
                } else {
                    // Điều chỉnh vị trí scroll khi load previous để giữ nguyên vị trí tương đối
                    const scrollDiff = newScrollHeight - previousScrollHeight;
                    messageListRef.current.scrollTop = previousScrollTop + scrollDiff;
                }
            });

            // const newMessages = res.data.data;

            // Lưu lại vị trí scroll và chiều cao trước khi update

            // if (direction === "next") {
            //     console.log("Set-3");

            //     setMessageList([...newMessages, ...messageList]);
            // } else {
            //     console.log("Set-4");
            //     setMessageList([...messageList, ...newMessages]);
            // }

            // Khôi phục vị trí scroll sau khi update
            // requestAnimationFrame(() => {
            //     if (!messageListRef.current) return;

            //     const newScrollHeight = messageListRef.current.scrollHeight;
            //     if (direction === "next") {
            //         // Giữ nguyên vị trí scroll khi load next
            //         messageListRef.current.scrollTop = previousScrollTop;
            //     } else {
            //         // Điều chỉnh vị trí scroll khi load previous để giữ nguyên vị trí tương đối
            //         const scrollDiff = newScrollHeight - previousScrollHeight;
            //         messageListRef.current.scrollTop = previousScrollTop + scrollDiff;
            //     }
            // });
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

    const groupedMessages = groupMessages();

    if (error) {
        return <ErrorMessage error={error} className="text-center" />;
    }

    return (
        <>
            <div
                ref={messageListRef}
                onScroll={handleScroll}
                className="w-full overflow-y-auto overflow-x-hidden h-full  px-4 pt-4 scrollbar"
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
                </div>
            </div>
        </>
    );
}
