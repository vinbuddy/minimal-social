import { useState } from "react";

interface useLoadingOutput {
    loading: boolean;
    startLoading: () => void;
    stopLoading: () => void;
}

const useLoading = (): useLoadingOutput => {
    const [loading, setLoading] = useState<boolean>(false);

    const startLoading = (): void => {
        setLoading(true);
    };

    const stopLoading = (): void => {
        setLoading(false);
    };

    return {
        loading,
        startLoading,
        stopLoading,
    };
};

export default useLoading;
