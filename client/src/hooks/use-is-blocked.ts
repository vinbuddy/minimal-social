import { useEffect, useState } from "react";
import { useAuthStore } from "./store";

const useIsBlocked = (userId?: string) => {
    const [isBlocked, setIsBlocked] = useState<boolean>(false);
    const { currentUser } = useAuthStore();

    useEffect(() => {
        if (!userId || !currentUser) return;

        const isBlockedResult = currentUser?.blockedUsers.some((blockedUser) => blockedUser._id === userId) || false;

        setIsBlocked(isBlockedResult);
    }, [currentUser, userId]);

    return isBlocked;
};

export default useIsBlocked;
