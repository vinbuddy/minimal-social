import { fetcher } from "@/utils/http-request";
import useSWRInfinite from "swr/infinite";

export default function usePagination<T>(url: string | null) {
    const LIMIT = 10;

    const getKey = (pageIndex: number, previousPageData: any[]) => {
        if (!url) return null;
        if (previousPageData && previousPageData.length === 0) return null; // reached the end
        return `${url}${url.includes("?") ? "&" : "?"}limit=${LIMIT}&page=${pageIndex + 1}`;
    };

    const { data, error, size, setSize, mutate, isLoading } = useSWRInfinite(getKey, fetcher);

    // Extract the data from the response structure
    const paginatedData: T[] = data ? data.flatMap((page) => page.data) : [];
    // const isReachedEnd = data && data[data.length - 1]?.data?.length < LIMIT;
    const isReachedEnd = data && data.length > 0 ? data[data.length - 1]?.data?.length < LIMIT : false;
    const loadingMore = data && typeof data[size - 1] === "undefined";

    return {
        data: paginatedData,
        error,
        size,
        isReachedEnd,
        loadingMore,
        isLoading,
        setSize,
        mutate,
    };
}
