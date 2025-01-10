"use client";

import { Avatar, Button, Input } from "@nextui-org/react";
import { LoaderIcon, SearchIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import cn from "classnames";

import UserName from "../user/user-name";
import TimeAgo from "../time-ago";
import { useDebounce, usePagination } from "@/hooks";
import { IMessage } from "@/types/message";
import { IConversation } from "@/types/conversation";
import { useMessagesStore } from "@/hooks/store";

interface IProps {
    conversation: IConversation;
}

export default function SearchMessage({ conversation }: IProps) {
    const [searchValue, setSearchValue] = useState<string>("");
    const debouncedSearch = useDebounce(searchValue, 800);
    const { messageIdReferenced, setMessageIdReferenced, setIsReference } = useMessagesStore();

    const {
        data: messages,
        loadingMore,
        error,
        isReachedEnd,
        size,
        isLoading,
        setSize: setPage,
    } = usePagination<IMessage>(
        debouncedSearch && conversation
            ? `/message/search?search=${debouncedSearch}&conversationId=${conversation._id}`
            : null
    );

    const getMatchedContent = useCallback((content: string, keyword: string, maxLength = 100) => {
        const keywordIndex = content.toLowerCase().indexOf(keyword.toLowerCase());
        if (keywordIndex === -1) return content;

        const start = Math.max(0, keywordIndex - Math.floor(maxLength / 2));
        const end = Math.min(content.length, keywordIndex + keyword.length + Math.floor(maxLength / 2));

        let matchedContent = content.substring(start, end);
        const highlightedKeyword = `<span class="text-link">${content.substring(
            keywordIndex,
            keywordIndex + keyword.length
        )}</span>`;

        matchedContent = matchedContent.replace(new RegExp(`(${keyword})`, "gi"), highlightedKeyword);

        if (start > 0) matchedContent = "..." + matchedContent;
        if (end < content.length) matchedContent += "...";

        return matchedContent;
    }, []);

    const messageList = useMemo(() => {
        return messages.map((message) => {
            // Implement highlight
            const highlightedContent = getMatchedContent(message.content, debouncedSearch);
            return (
                <li
                    className={cn(
                        "flex items-center justify-between py-4 px-2 cursor-pointer rounded-xl hover:bg-content2 border",
                        {
                            "!border-default": messageIdReferenced && message._id === messageIdReferenced,
                            "border-transparent": message._id !== messageIdReferenced,
                        }
                    )}
                    key={message._id}
                    onClick={() => setMessageIdReferenced(message._id)}
                >
                    <section className="flex items-center gap-3 overflow-hidden">
                        <Avatar size="md" src={message?.sender?.photo} />

                        <div className="flex-1 overflow-hidden">
                            <div className="flex items-center gap-1">
                                <UserName className="text-sm" isLink={false} user={message?.sender} />
                                <span className="text-default-500">•</span>
                                <TimeAgo date={message?.createdAt} className="text-default-500 text-xs" />
                            </div>

                            <p
                                className="text-default-500 text-sm line-clamp-2 max-w-[90%]"
                                dangerouslySetInnerHTML={{ __html: highlightedContent }}
                            />
                        </div>
                    </section>
                </li>
            );
        });
    }, [debouncedSearch, messages, getMatchedContent, messageIdReferenced, setMessageIdReferenced, setIsReference]);

    return (
        <div>
            <Input
                isClearable
                defaultValue={""}
                value={searchValue}
                placeholder="Search in conversation"
                variant="faded"
                size="md"
                startContent={<SearchIcon className="text-default-400 me-1" size={18} />}
                type="text"
                endContent={isLoading ? <LoaderIcon size={18} className="animate-spin" /> : undefined}
                onChange={(e) => setSearchValue(e.target.value)}
                onClear={() => setSearchValue("")}
            />
            <div className="py-5">
                {messages.length === 0 && !isLoading && !error && (
                    <p className="text-center text-default-500">No result found</p>
                )}
                <ul>
                    {messageList}

                    {!isReachedEnd && messages.length > 0 && (
                        <li className="flex justify-center mt-5">
                            <Button
                                variant="flat"
                                radius="full"
                                isLoading={loadingMore}
                                onClick={() => setPage(size + 1)}
                            >
                                Load more
                            </Button>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
