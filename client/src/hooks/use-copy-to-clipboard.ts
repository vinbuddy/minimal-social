import { showToast } from "@/utils/toast";
import { useCallback } from "react";

import { t } from "i18next";

const useClipboard = () => {
    const copyToClipboard = useCallback(async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            showToast(t("COPIED_TO_CLIPBOARD"), "success");
        } catch (err) {
            showToast("Copy to clipboard failed", "error");
        }
    }, []);

    return copyToClipboard;
};

export default useClipboard;
