"use client";

import { Avatar, Input, Spinner, User } from "@heroui/react";
import { LoaderIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Fragment, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import useSWR from "swr";

import { BackButton, ErrorMessage } from "@/components";
import { PostItem } from "@/components/post";
import { UserItem, UserSuggestionList } from "@/components/user";
import { usePagination, useDebounce, useVisibility } from "@/hooks";
import { IPost, ISelectMediaFile } from "@/types/post";
import { IUser } from "@/types/user";
import { useTranslation } from "react-i18next";
import { FullScreenMediaSlider } from "@/components/media";

export default function SearchPage() {
    const [searchValue, setSearchValue] = useState("");
    const debouncedSearch = useDebounce(searchValue, 800);

    const { isVisible, show: showFullscreenSlider, hide: hideFullscreenSlider } = useVisibility();
    const [mediaInfo, setMediaInfo] = useState<ISelectMediaFile>({
        mediaFiles: [],
        index: 0,
    });

    const { t } = useTranslation("common");

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
            <FullScreenMediaSlider
                onHide={hideFullscreenSlider}
                isOpen={isVisible}
                activeSlideIndex={mediaInfo?.index ?? 0}
                mediaFiles={mediaInfo?.mediaFiles ?? []}
            />
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
                            placeholder={t("SEARCH") + "..."}
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
                                        <p className="text-default-400">{t("SEARCHING_FOR")}: &nbsp;</p>
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
                                <p className="text-center">{t("NO_RESULT")}</p>
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
                                            <PostItem
                                                post={post}
                                                onSelectMediaFile={(mediaInfo) => {
                                                    setMediaInfo(mediaInfo);
                                                    showFullscreenSlider();
                                                }}
                                            />
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
