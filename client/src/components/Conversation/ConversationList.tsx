"use client";
import { Button, Input, Spinner } from "@nextui-org/react";
import { LoaderIcon, PlusIcon, SearchIcon } from "lucide-react";
import ConversationItem from "./ConversationItem";
import usePagination from "@/hooks/usePagination";
import { IConversation, IPrivateConversationResult } from "@/types/conversation";
import useAuthStore from "@/hooks/store/useAuthStore";
import InfiniteScroll from "react-infinite-scroll-component";
import { Fragment, useState } from "react";
import ConversationSkeletons from "./ConversationSkeletons";
import useDebounce from "@/hooks/useDebounce";
import useSWR from "swr";
import Link from "next/link";
import UserItem from "../User/UserItem";
import axiosInstance from "@/utils/httpRequest";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TOAST_OPTIONS } from "@/utils/toast";

type ConversationResponse = {
    data: {
        privateConversations: IPrivateConversationResult[];
        groupConversations: IConversation[];
    };
};

export default function ConversationList() {
    const [searchValue, setSearchValue] = useState<string>("");
    const { currentUser } = useAuthStore();
    const debouncedSearch = useDebounce(searchValue, 800);
    const router = useRouter();

    const getURL = () => {
        if (!currentUser) return null;

        return `/conversation?userId=${currentUser._id}`;
    };

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

    const {
        data: conversationResults,
        error: searchError,
        isLoading: isSearchLoading,
        mutate: mutateSearch,
    } = useSWR<ConversationResponse>(
        debouncedSearch && currentUser
            ? `/conversation/search?userId=${currentUser?._id}&search=${debouncedSearch}`
            : null
    );

    const isSearchResultEmpty =
        !conversationResults?.data?.privateConversations?.length ||
        !conversationResults?.data?.privateConversations?.length;
    const isShowedSearchError = error && !isLoading;
    const isShowedNoSearchResults = conversationResults && !isLoading && !error && isSearchResultEmpty;
    const isShowedResults = !isLoading && !error && !isSearchResultEmpty;

    const handleNavigateToConversation = async (userId: string) => {
        if (!currentUser || !userId) return;

        try {
            const res = await axiosInstance.post("/conversation", {
                participants: [currentUser?._id, userId],
            });

            const conversationResponded = res.data.data as IConversation;

            const conversationId = conversationResponded._id;

            setSearchValue("");

            mutate();

            router.push(`/conversation/${conversationId}`);
        } catch (error: any) {
            toast.error("Failed to create conversation", TOAST_OPTIONS);
            toast.error(error.response.data.message, TOAST_OPTIONS);
        }
    };

    const renderPrivateConversationResults = () => {
        return (
            <div>
                {isShowedResults &&
                    !isLoading &&
                    conversationResults.data.privateConversations.map((privateCon, index) => {
                        if (privateCon?.conversation && privateCon?.user) {
                            return (
                                <Link
                                    href={`/conversation/${privateCon.conversation._id}`}
                                    key={privateCon.conversation._id}
                                    className="hover:bg-content2 block rounded-xl px-2"
                                >
                                    <UserItem
                                        avatarProps={{ size: "lg", isBordered: false }}
                                        isShowedFollowButton={false}
                                        href={undefined}
                                        user={privateCon.user}
                                    />
                                </Link>
                            );
                        }

                        return (
                            <div
                                onClick={() => handleNavigateToConversation(privateCon.user._id)}
                                key={Date.now()}
                                className="hover:bg-content2 block rounded-xl px-2"
                            >
                                <UserItem
                                    avatarProps={{ size: "lg", isBordered: false }}
                                    href={undefined}
                                    isShowedFollowButton={false}
                                    user={privateCon.user}
                                />
                            </div>
                        );
                    })}

                {isShowedSearchError && <p className="text-center text-danger">{error?.message}</p>}
                {isShowedNoSearchResults && <p className="text-center">No search results</p>}
            </div>
        );
    };

    const renderConversations = () => {
        return (
            <div>
                {error && !isLoading && <p className="text-center text-danger">{error?.message}</p>}
                {currentUser && conversations.length === 0 && !isLoading && !error && (
                    <p className="text-center">No conversations yet</p>
                )}
                {!error && conversations.length > 0 && (
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
                            <div className="mb-2 last:mb-0" key={conversation?._id}>
                                <ConversationItem conversation={conversation} />
                            </div>
                        ))}
                    </InfiniteScroll>
                )}

                {isLoading && <ConversationSkeletons length={5} />}
            </div>
        );
    };

    return (
        <div id="conversation-list" className="h-screen overflow-auto border-r-1 border-divider px-4 pb-4 scrollbar">
            <div className="sticky top-0 py-4 bg-background z-10">
                <header className="h-[40px] flex items-center justify-between mb-5">
                    <h1 className="font-bold text-xl">Chat</h1>

                    <Button isIconOnly variant="flat" radius="full">
                        <PlusIcon size={18} />
                    </Button>
                </header>
                <Input
                    isClearable={!isSearchLoading}
                    classNames={{
                        base: "w-full",
                        inputWrapper: "h-[2.8rem] px-4 shadow",
                    }}
                    defaultValue={""}
                    value={searchValue}
                    placeholder="Search..."
                    size="md"
                    variant="flat"
                    radius="full"
                    startContent={<SearchIcon className="text-default-400 me-1" size={18} />}
                    endContent={isSearchLoading ? <LoaderIcon size={18} className="animate-spin" /> : undefined}
                    type="text"
                    onChange={(e) => setSearchValue(e.target.value)}
                    onClear={() => setSearchValue("")}
                />
            </div>

            {debouncedSearch ? renderPrivateConversationResults() : renderConversations()}
        </div>
    );
}
