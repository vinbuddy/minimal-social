"use client";

import { Spinner } from "@nextui-org/react";
import { Fragment } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import UserItem from "./user-item";
import UserSkeletons from "./user-skeletons";

import { useAuthStore } from "@/hooks/store";
import { usePagination } from "@/hooks";
import { IUser } from "@/types/user";
import ErrorMessage from "../error-message";

export default function UserSuggestionList() {
    const { currentUser } = useAuthStore();

    const {
        data: users,
        loadingMore,
        error,
        isReachedEnd,
        size,
        isLoading,
        setSize: setPage,
        mutate,
    } = usePagination<IUser>(currentUser ? `/user/suggestion?userId=${currentUser?._id}` : null);

    return (
        <div>
            {error && !isLoading && <ErrorMessage error={error} className="text-center" />}
            {users.length === 0 && !isLoading && !error && <p className="text-center"></p>}
            {!error && users.length > 0 && (
                <InfiniteScroll
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
                        <Fragment key={user?._id}>
                            <UserItem href={`/profile/${user?._id}`} user={user} />
                        </Fragment>
                    ))}
                </InfiniteScroll>
            )}

            {isLoading && <UserSkeletons length={4} />}
        </div>
    );
}
