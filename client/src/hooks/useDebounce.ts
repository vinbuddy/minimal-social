import { useState, useEffect } from "react";

function useSearchDebounce(value: string, delay: number) {
    const [deBouncedValue, setDebouncedValue] = useState<string>("");

    useEffect(() => {
        const hanler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(hanler);
    }, [value, delay]);

    return deBouncedValue;
}

export default useSearchDebounce;
