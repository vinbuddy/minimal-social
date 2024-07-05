"use client";
import { createContext, useContext, useEffect } from "react";
import useAuthStore from "../hooks/store/useAuthStore";
import axiosInstance from "@/utils/httpRequest";
import { IUser } from "../types/user";
import PageLoading from "@/components/PageLoading";
export const AuthContext = createContext({});
export const useAuthContext = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }: { children: any }) => {
    const { currentUser, isAuthenticated, accessToken, isLoaded } = useAuthStore();

    useEffect(() => {
        (async () => {
            try {
                if (!isLoaded) return;

                if (!accessToken) return;

                if (isAuthenticated || currentUser) return;

                // const tokenDecoded = jwtDecode(accessToken) as { _id: string };
                // const response = await axiosInstance.get("/user/" + tokenDecoded._id, { withCredentials: true });
                const response = await axiosInstance.get("/auth/me");

                if (response.status === 200) {
                    const user = response.data.data as IUser;
                    useAuthStore.setState({ currentUser: user, isAuthenticated: true });
                }
            } catch (error: any) {
                console.error(error?.message);
            }
        })();
    }, [isLoaded, isAuthenticated, accessToken]);

    if (!isLoaded) return <PageLoading />;

    return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};
