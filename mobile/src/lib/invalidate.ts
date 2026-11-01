import { mutate } from "swr";

type Listener = (pattern: string) => void;

const listeners = new Set<Listener>();

/** usePagination lists subscribe here: SWR's global mutate(filter) doesn't revalidate useSWRInfinite lists */
export function onInvalidate(listener: Listener) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

/**
 * Refetch every mounted list and single-resource cache whose URL contains `pattern`
 * ("/post" after creating a post, "/comment?targetType=Post&target=…" after commenting).
 */
export function invalidate(pattern: string) {
    listeners.forEach((listener) => listener(pattern));
    mutate((key) => typeof key === "string" && !key.startsWith("$inf$") && key.includes(pattern));
}
