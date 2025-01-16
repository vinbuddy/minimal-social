"use client";

import { Avatar, Input, Spinner, User } from "@nextui-org/react";
import { LoaderIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Fragment, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import useSWR from "swr";

import BackButton from "@/components/back-button";
import MainLayout from "@/components/main-layout";
import PostItem from "@/components/post/post-item";
import UserItem from "@/components/user/user-item";
import UserSuggestionList from "@/components/user/user-suggetion-list";
import { usePagination, useDebounce } from "@/hooks";
import { IPost } from "@/types/post";
import { IUser } from "@/types/user";
import ErrorMessage from "@/components/error-message";

export default function SearchPage() {
    const [searchValue, setSearchValue] = useState("");
    const debouncedSearch = useDebounce(searchValue, 800);

    const searchParams = useSearchParams();
    const query = searchParams.get("query");

    const {
        data: autocompleteResults,
        error,
        isLoading,
    } = useSWR<{ data: IUser[] }>(debouncedSearch ? `/search/autocomplete?query=${debouncedSearch}` : null);

    const isDataEmpty = !autocompleteResults?.data?.length;
    const showError = error && !isLoading;
    const showNoResults = autocompleteResults && !isLoading && !error && isDataEmpty;
    const hasResults = !isLoading && !error && !isDataEmpty;

    const {
        data: posts,
        loadingMore,
        error: searchError,
        isReachedEnd,
        size,
        isLoading: isSearchLoading,
        setSize: setPage,
        mutate,
    } = usePagination<IPost>(`/search/post?query=${query}`);

    return (
        <div className="flex justify-center w-full">
            <div className="w-[calc(100vw_-_80px)] md:w-[630px]">
                <header className="sticky top-0 z-10 p-4 bg-background">
                    {!query && (
                        <Input
                            isClearable={!isLoading}
                            classNames={{
                                base: "w-full",
                                inputWrapper: "h-[2.8rem] px-4",
                            }}
                            defaultValue={""}
                            value={searchValue}
                            placeholder="Search..."
                            size="md"
                            variant="flat"
                            radius="full"
                            startContent={<SearchIcon className="text-default-400 me-1" size={18} />}
                            endContent={isLoading ? <LoaderIcon size={18} className="animate-spin" /> : undefined}
                            type="text"
                            onChange={(e) => setSearchValue(e.target.value)}
                            onClear={() => setSearchValue("")}
                        />
                    )}

                    {query && (
                        <div className="flex justify-between items-center">
                            <BackButton />
                            <User
                                className="bg-content2 rounded-full py-1.5 ps-2 pe-5"
                                name={
                                    <div className="flex items-center">
                                        <p className="text-default-400">Searching for: &nbsp;</p>
                                        <span className="text-link">{query}</span>
                                    </div>
                                }
                                avatarProps={{
                                    size: "sm",
                                    src: undefined,
                                    className: "bg-content3",
                                    fallback: <SearchIcon className="text-default-400" size={18} />,
                                }}
                            />
                        </div>
                    )}
                </header>

                <main className="px-4 pb-4">
                    {/* Autocomplete */}
                    {!query ? (
                        <section>
                            {!autocompleteResults && !searchValue && <UserSuggestionList />}

                            {showError && <ErrorMessage error={error} className="text-center" />}

                            {searchValue && (
                                <div>
                                    <div className="flex items-center justify-between py-4 border-b border-divider ps-1">
                                        <Link
                                            href={`/search?query=${searchValue}`}
                                            title={`Searching for ${searchValue}`}
                                            className="flex-1 flex items-center gap-4 cursor-pointer"
                                        >
                                            <Avatar
                                                size="sm"
                                                fallback={<SearchIcon size={18} />}
                                                classNames={{
                                                    base: "bg-transparent",
                                                }}
                                            />
                                            <h4>{searchValue}</h4>
                                        </Link>
                                    </div>

                                    {hasResults &&
                                        !isLoading &&
                                        autocompleteResults?.data.map((user) => (
                                            <UserItem href={`/profile/${user?._id}`} key={user?._id} user={user} />
                                        ))}
                                </div>
                            )}
                        </section>
                    ) : (
                        <section>
                            {searchError && !isSearchLoading && (
                                <p className="text-center text-danger">{searchError?.message}</p>
                            )}

                            {posts.length === 0 && !isSearchLoading && !searchError && (
                                <p className="text-center">Result not found</p>
                            )}
                            {!searchError && posts.length > 0 && (
                                <InfiniteScroll
                                    next={() => setPage(size + 1)}
                                    hasMore={!isReachedEnd}
                                    loader={
                                        <div className="flex justify-center items-center overflow-hidden h-[70px]">
                                            <Spinner size="md" />
                                        </div>
                                    }
                                    dataLength={posts?.length ?? 0}
                                >
                                    {posts.map((post) => (
                                        <Fragment key={post?._id}>
                                            <PostItem post={post} />
                                        </Fragment>
                                    ))}
                                </InfiniteScroll>
                            )}
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
}
