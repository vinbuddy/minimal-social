import { useState, useCallback } from "react";

export default function useItemClick<T>() {
    const [item, setItem] = useState<T | null>(null);

    const handleItemClick = useCallback((item: T | null) => {
        setItem(item);
    }, []);

    return {
        item,
        onItemClick: handleItemClick,
    };
}
