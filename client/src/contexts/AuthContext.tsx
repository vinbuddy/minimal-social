"use client";
import { createContext, useContext, useEffect, useState } from "react";
import useAuthStore from "../hooks/store/useAuthStore";
import axiosInstance from "@/utils/httpRequest";
import { IUser } from "../types/user";
import PageLoading from "@/components/PageLoading";
import { refreshAccessToken } from "@/utils/jwt";
export const AuthContext = createContext({});
export const useAuthContext = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }: { children: any }) => {
    const { currentUser, isAuthenticated, accessToken, refreshToken, isLoaded } = useAuthStore();
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                if (!isLoaded) return;

                if (!accessToken && refreshToken) {
                    setLoading(true);
                    const { newAccessToken, newRefreshToken } = await refreshAccessToken();

                    useAuthStore.setState({
                        accessToken: newAccessToken,
                        refreshToken: newRefreshToken,
                        isAuthenticated: true,
                    });

                    setLoading(false);
                }

                if (isAuthenticated || currentUser) return;
                const response = await axiosInstance.get("/auth/me");

                if (response.status === 200) {
                    const user = response.data.data as IUser;
                    useAuthStore.setState({ currentUser: user, isAuthenticated: true });
                }
            } catch (error: any) {
                console.error(error?.message);
            }
        };

        initializeAuth();
    }, [isLoaded, isAuthenticated, accessToken]);

    return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};
