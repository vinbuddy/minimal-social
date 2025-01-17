"use client";
import { Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner, useDisclosure } from "@heroui/react";
import { useState } from "react";
import { LoaderIcon, SearchIcon } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";

import UserItem from "./user-item";
import UserSkeletons from "./user-skeletons";

import { IUser } from "@/types/user";
import { usePagination, useDebounce } from "@/hooks";
import ErrorMessage from "../error-message";

interface IProps {
    children: React.ReactNode;
    type: "follower" | "following";
    user?: IUser;
}

export default function UserFollowInfoModal({ children, type = "follower", user }: IProps) {
    const { isOpen, onOpenChange, onOpen, onClose } = useDisclosure();

    const [searchValue, setSearchValue] = useState("");
    const debouncedSearch = useDebounce(searchValue, 800);

    const getURL = () => {
        switch (type) {
            case "follower":
                return `/user/follower?userId=${user?._id}&search=${debouncedSearch}`;
            default:
                return `/user/following?userId=${user?._id}&search=${debouncedSearch}`;
        }
    };

    const {
        data: users,
        loadingMore,
        error,
        isReachedEnd,
        size,
        isLoading,
        setSize: setPage,
        mutate,
    } = usePagination<IUser>(user ? getURL() : null);

    return (
        <>
            <div className="cursor-pointer" onClick={onOpen}>
                {children}
            </div>

            <Modal scrollBehavior="inside" hideCloseButton size="lg" isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex items-center justify-between gap-7">
                                {type === "follower" ? "Followers" : "Following"}

                                <Input
                                    isClearable
                                    classNames={{
                                        base: "w-full",
                                        inputWrapper: "h-[2.8rem] px-4 shadow",
                                    }}
                                    defaultValue={""}
                                    value={searchValue}
                                    placeholder="Search..."
                                    size="md"
                                    radius="md"
                                    startContent={<SearchIcon className="text-default-400 me-1" size={18} />}
                                    endContent={
                                        isLoading ? <LoaderIcon size={18} className="animate-spin" /> : undefined
                                    }
                                    type="text"
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    onClear={() => setSearchValue("")}
                                />
                            </ModalHeader>
                            <ModalBody
                                id={type === "follower" ? "follower-list" : "following-list"}
                                className="py-0 px-6 scrollbar"
                            >
                                <div>
                                    {error && !isLoading && <ErrorMessage error={error} className="text-center" />}
                                    {users.length === 0 && !isLoading && !error && (
                                        <p className="text-center mt-2">
                                            {type === "follower" ? "No followers" : "Not following anyone"}
                                        </p>
                                    )}
                                    {!error && users.length > 0 && (
                                        <InfiniteScroll
                                            scrollableTarget={type === "follower" ? "follower-list" : "following-list"}
                                            next={() => setPage(size + 1)}
                                            hasMore={!isReachedEnd}
                                            loader={
                                                <div className="flex justify-center items-center overflow-hidden h-[70px]">
                                                    <Spinner size="md" />
                                                </div>
                                            }
                                            dataLength={users?.length ?? 0}
                                        >
                                            {users.map((user) => (
                                                <UserItem key={user?._id} user={user} />
                                            ))}
                                        </InfiniteScroll>
                                    )}
                                    {isLoading && <UserSkeletons length={3} />}
                                </div>
                            </ModalBody>
                            <ModalFooter></ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
