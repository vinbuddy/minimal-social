import { useEffect, useState } from "react";
import { useAuthStore } from "./store";

const useIsOwner = (userId?: string) => {
    const [isOwner, setIsOwner] = useState<boolean>(false);
    const { currentUser } = useAuthStore();

    useEffect(() => {
        if (!userId || !currentUser) return;

        if (userId === currentUser._id) {
            setIsOwner(true);
        } else {
            setIsOwner(false);
        }
    }, [currentUser, userId]);

    return isOwner;
};

export default useIsOwner;
