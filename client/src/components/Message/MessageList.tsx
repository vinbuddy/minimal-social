"use client";
import usePagination from "@/hooks/usePagination";
import { IConversation } from "@/types/conversation";
import { IMessage } from "@/types/message";
import { Spinner } from "@nextui-org/react";
import { Fragment } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import MessageItem from "./MessageItem";

interface IProps {
    conversation: IConversation;
}

interface GroupedMessage {
    messages: IMessage[];
    marginBottom: string;
}

export default function MessageList({ conversation }: IProps) {
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

    const groupedMessages = groupMessages(messages);

    return (
        <>
            <div
                id="messageList"
                style={{
                    height: "100%",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column-reverse",
                }}
                className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col p-4 scrollbar"
            >
                {/* <MessageItem /> */}
                {error && !isLoading && <p className="text-center text-danger">{error?.message}</p>}
                {/* {messages.length === 0 && !isLoading && !error && <p className="text-center">Start a conversation </p>} */}
                {isLoading && (
                    <div className="h-full flex justify-center items-center">
                        <Spinner size="md" />
                    </div>
                )}
                {!error && messages.length > 0 && (
                    <InfiniteScroll
                        scrollableTarget="messageList"
                        inverse={true}
                        style={{ display: "flex", flexDirection: "column-reverse" }}
                        next={() => setPage(size + 1)}
                        hasMore={!isReachedEnd}
                        loader={
                            <div className="flex justify-center items-start overflow-hidden h-[70px]">
                                <Spinner size="md" />
                            </div>
                        }
                        dataLength={messages?.length ?? 0}
                    >
                        <div>
                            {groupedMessages.map((group, index) => (
                                <Fragment key={index}>
                                    <MessageItem messages={group.messages} className={`${group.marginBottom}`} />
                                </Fragment>
                            ))}
                        </div>
                    </InfiniteScroll>
                )}
            </div>
        </>
    );
}
