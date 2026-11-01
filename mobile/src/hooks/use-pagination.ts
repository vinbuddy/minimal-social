import { useEffect } from "react";
import useSWRInfinite from "swr/infinite";

import { fetcher } from "@/lib/http";
import { onInvalidate } from "@/lib/invalidate";
import { IPaginated } from "@/types/post";

/** Same page size as the web */
export const PAGE_LIMIT = 10;

/**
 * Offset pagination over the API's `?page=&limit=` lists, like the web's usePagination.
 * Pass null to pause (e.g. replies that haven't been expanded).
 */
export function usePagination<T>(url: string | null) {
    const getKey = (pageIndex: number, previousPage: IPaginated<T> | null) => {
        if (!url) return null;
        if (previousPage && previousPage.data.length < PAGE_LIMIT) return null;

        return `${url}${url.includes("?") ? "&" : "?"}limit=${PAGE_LIMIT}&page=${pageIndex + 1}`;
    };

    const { data, error, size, setSize, isLoading, isValidating, mutate } = useSWRInfinite<IPaginated<T>>(getKey, fetcher, {
        revalidateFirstPage: false,
    });

    useEffect(() => {
        if (!url) return;
        return onInvalidate((pattern) => {
            if (url.includes(pattern)) mutate();
        });
    }, [url, mutate]);

    const items = data?.flatMap((page) => page.data) ?? [];
    const lastPage = data?.[data.length - 1];
    const isReachedEnd = !!lastPage && lastPage.data.length < PAGE_LIMIT;
    const isLoadingMore = isLoading || (size > 0 && !!data && typeof data[size - 1] === "undefined");

    return {
        items,
        error,
        isLoading,
        isLoadingMore,
        isRefreshing: isValidating && !isLoadingMore,
        isReachedEnd,
        loadMore: () => {
            if (!isReachedEnd && !isLoadingMore) setSize(size + 1);
        },
        refresh: () => mutate(),
        mutate,
    };
}
