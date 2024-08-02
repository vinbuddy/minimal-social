"use client";
import { Button, Input, Spinner } from "@nextui-org/react";
import { PlusIcon, SearchIcon } from "lucide-react";
import ConversationItem from "./ConversationItem";
import usePagination from "@/hooks/usePagination";
import { IConversation } from "@/types/conversation";
import useAuthStore from "@/hooks/store/useAuthStore";
import InfiniteScroll from "react-infinite-scroll-component";
import { Fragment } from "react";
import ConversationSkeletons from "./ConversationSkeletons";

export default function ConversationSidebar() {
    const { currentUser } = useAuthStore();

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
                    // isClearable={!isLoading}
                    isClearable
                    classNames={{
                        base: "w-full",
                        inputWrapper: "h-[2.8rem] px-4 shadow",
                    }}
                    defaultValue={""}
                    // value={searchValue}
                    placeholder="Search..."
                    size="md"
                    variant="flat"
                    radius="full"
                    startContent={<SearchIcon className="text-default-400 me-1" size={18} />}
                    // endContent={isLoading ? <LoaderIcon size={18} className="animate-spin" /> : undefined}
                    type="text"
                    // onChange={(e) => setSearchValue(e.target.value)}
                    // onClear={() => setSearchValue("")}
                />
            </div>

            {/* chat list */}
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
                            <Fragment key={conversation?._id}>
                                <ConversationItem conversation={conversation} />
                            </Fragment>
                        ))}
                    </InfiniteScroll>
                )}

                {isLoading && <ConversationSkeletons length={5} />}
            </div>
        </div>
    );
}
