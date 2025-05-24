"use client";

import { Input, Spinner } from "@heroui/react";
import { LoaderIcon, SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useCallback, useMemo, useEffect } from "react";
import useSWR from "swr";
import InfiniteScroll from "react-infinite-scroll-component";

import ConversationItem from "./conversation-item";
import ConversationSkeletons from "./conversation-skeletons";
import UserItem from "../user/user-item";

import { useAuthStore } from "@/hooks/store";
import { usePagination, useDebounce } from "@/hooks";
import { IConversation, IPrivateConversationResult } from "@/types/conversation";
import axiosInstance from "@/utils/http-request";
import { showToast } from "@/utils/toast";
import ErrorMessage from "../error-message";
import { useTranslation } from "react-i18next";

type ConversationResponse = {
    data: {
        privateConversations: IPrivateConversationResult[];
        groupConversations: IConversation[];
    };
};

interface IProps {
    onConversationClick?: (conversation: IConversation) => void;
}

export default function ConversationList({ onConversationClick }: IProps) {
    const [searchValue, setSearchValue] = useState<string>("");
    const { currentUser } = useAuthStore();
    const debouncedSearch = useDebounce(searchValue, 800);
    const router = useRouter();
    const { t: tChat } = useTranslation("chat");
    const { t } = useTranslation("common");

    // Generate API URL
    const getURL = useCallback(() => {
        return currentUser ? `/conversation?userId=${currentUser._id}` : null;
    }, [currentUser]);

    // Fetch conversations
    const {
        data: conversations,
        loadingMore,
        error,
        isReachedEnd,
        size,
        isLoading,
        setSize: setPage,
        mutate,
    } = usePagination<IConversation>(getURL());

    // Fetch search results
    const {
        data: conversationResults,
        error: searchError,
        isLoading: isSearchLoading,
    } = useSWR<ConversationResponse>(
        debouncedSearch && currentUser
            ? `/conversation/search?userId=${currentUser?._id}&search=${debouncedSearch}`
            : null
    );

    useEffect(() => {
        mutate();
    }, [mutate]);

    // Derived states
    const isSearchResultEmpty = useMemo(
        () =>
            !conversationResults?.data?.privateConversations?.length &&
            !conversationResults?.data?.groupConversations?.length,
        [conversationResults]
    );

    const handleNavigateToConversation = useCallback(
        async (userId: string) => {
            if (!currentUser || !userId) return;

            try {
                const res = await axiosInstance.post("/conversation", {
                    participants: [currentUser._id, userId],
                });

                const conversationId = res.data.data._id;

                setSearchValue("");
                mutate(); // Refresh conversations list
                router.push(`/conversation/${conversationId}`);
            } catch (error: any) {
                showToast(error?.response?.data?.message || "An error occurred", "error");
            }
        },
        [currentUser, router, mutate]
    );

    const renderPrivateConversationResults = useMemo(() => {
        if (!debouncedSearch) return null;

        if (isSearchResultEmpty) return <p className="text-center">{tChat("CHAT.NO_CONVERSATION")}</p>;
        if (searchError) return <ErrorMessage error={searchError} className="text-center" />;

        return (
            <div>
                {conversationResults?.data.privateConversations.map((privateCon) => {
                    if (privateCon?.conversation && privateCon?.user) {
                        return (
                            <Link
                                onClick={(e) => {
                                    onConversationClick?.(privateCon.conversation);

                                    // Check if currentUser._id is in hiddenBy
                                    const hiddenBy = privateCon.conversation.hiddenBy;
                                    if (currentUser && hiddenBy.includes(currentUser._id)) {
                                        e.preventDefault();
                                        handleNavigateToConversation(privateCon.user._id);
                                    }
                                }}
                                href={`/conversation/${privateCon.conversation._id}`}
                                key={privateCon.conversation._id}
                                className="hover:bg-content2 block rounded-xl px-2"
                            >
                                <UserItem
                                    avatarProps={{ size: "lg", isBordered: false }}
                                    isShowedFollowButton={false}
                                    user={privateCon.user}
                                    href=""
                                />
                            </Link>
                        );
                    }

                    return (
                        <div
                            onClick={() => handleNavigateToConversation(privateCon.user._id)}
                            key={privateCon.user._id}
                            className="hover:bg-content2 block rounded-xl px-2"
                        >
                            <UserItem
                                avatarProps={{ size: "lg", isBordered: false }}
                                isShowedFollowButton={false}
                                user={privateCon.user}
                            />
                        </div>
                    );
                })}
            </div>
        );
    }, [debouncedSearch, conversationResults, searchError, handleNavigateToConversation, onConversationClick]);

    const renderConversations = useMemo(() => {
        if (isLoading) return <ConversationSkeletons length={5} />;
        if (error) return <ErrorMessage error={error} className="text-center" />;
        if (conversations.length === 0) return <p className="text-center">No conversations yet</p>;

        return (
            <InfiniteScroll
                scrollableTarget="conversation-list"
                next={() => setPage(size + 1)}
                hasMore={!isReachedEnd}
                loader={
                    <div className="flex justify-center items-center overflow-hidden h-[70px]">
                        <Spinner size="md" />
                    </div>
                }
                dataLength={conversations?.length ?? 0}
            >
                {conversations.map((conversation) => (
                    <div
                        onClick={() => onConversationClick?.(conversation)}
                        className="mb-2 last:mb-0"
                        key={conversation._id}
                    >
                        <ConversationItem conversation={conversation} />
                    </div>
                ))}
            </InfiniteScroll>
        );
    }, [isLoading, error, conversations, setPage, size, isReachedEnd, onConversationClick]);

    return (
        <div id="conversation-list" className="h-screen overflow-auto border-r-1 border-divider px-4 pb-4 scrollbar">
            <div className="sticky top-0 py-4 bg-background z-10">
                <header className="h-[40px] flex items-center justify-between mb-5">
                    <h1 className="font-bold text-xl">Chat</h1>
                </header>
                <Input
                    isClearable={!isSearchLoading}
                    classNames={{ base: "w-full", inputWrapper: "h-[2.8rem] px-4" }}
                    value={searchValue}
                    placeholder={t("SEARCH") + "..."}
                    size="md"
                    variant="faded"
                    startContent={<SearchIcon className="text-default-400 me-1" size={18} />}
                    endContent={isSearchLoading && <LoaderIcon size={18} className="animate-spin" />}
                    type="text"
                    onChange={(e) => setSearchValue(e.target.value)}
                    onClear={() => setSearchValue("")}
                />
            </div>
            {debouncedSearch ? renderPrivateConversationResults : renderConversations}
        </div>
    );
}
