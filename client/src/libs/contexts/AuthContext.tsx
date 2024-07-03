"use client";
import { createContext, useContext, useEffect, useState } from "react";
import useAuthStore from "../hooks/store/useAuthStore";
import axiosInstance from "@/utils/httpRequest";
import { useRouter } from "next/navigation";
import { IUser } from "../types/user";

export const AuthContext = createContext({});
export const useAuthContext = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }: { children: any }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const { currentUser, isAuthenticated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        (async () => {
            // Fetch auth get me
            try {
                // if (!isAuthenticated && currentUser === null) {
                //     const response = await axiosInstance.get("/user/me");
                //     const user = response.data?.data as IUser;
                //     useAuthStore.getState().setAuth(user);
                // }
            } catch (error) {
                console.error(error);
                router.push("/login");
            }
        })();
    }, []);

    return <AuthContext.Provider value={{}}>{loading ? <></> : children}</AuthContext.Provider>;
};
