import { showToast } from "@/utils/toast";
import { useCallback } from "react";

const useClipboard = () => {
    const copyToClipboard = useCallback(async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            showToast("Copied to clipboard", "success");
        } catch (err) {
            showToast("Copy to clipboard failed", "error");
        }
    }, []);

    return copyToClipboard;
};

export default useClipboard;
