import { fetcher } from "@/utils/httpRequest";
import useSWRInfinite from "swr/infinite";

export default function usePagination<T>(url: string | null) {
    const LIMIT = 15;

    if (url && !url.includes("?")) {
        url += "?";
    } else if (url && !url.endsWith("&")) {
        url += "&";
    }

    const getKey = (pageIndex: number, previousPageData: any[]) => {
        if (!url) return null;
        if (previousPageData && !previousPageData.length) return null; // reached the end
        return `${url}limit=${LIMIT}&page=${pageIndex + 1}`;
    };

    const { data, error, size, setSize, mutate, isLoading } = useSWRInfinite(getKey, fetcher);

    // Extract the data from the response structure
    const paginatedData: T[] = data ? data.flatMap((page) => page.data) : [];
    const isReachedEnd = data && data[data.length - 1]?.data?.length < LIMIT;
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
