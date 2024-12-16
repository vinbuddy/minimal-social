"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import useAuthStore from "../hooks/store/use-auth-store";
import axiosInstance from "@/utils/httpRequest";
import { IUser } from "../types/user";
import PageLoading from "@/components/page-loading";
import { refreshAccessToken } from "@/utils/jwt";

export const AuthContext = createContext({});
export const useAuthContext = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }: { children: any }) => {
    const { currentUser, isAuthenticated, accessToken, refreshToken, isLoaded } = useAuthStore();

    const [loading, setLoading] = useState<boolean>(false);

    const pathName = usePathname();
    const router = useRouter();

    useEffect(() => {
        const initializeAuth = async () => {
            try {
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
                    if (pathName === "/login" || pathName === "/register") {
                        router.push("/");
                    }
                }
            } catch (error: any) {
                console.error(error?.message);
            } finally {
                setLoading(false);
            }
        };

        if (typeof window !== "undefined") {
            initializeAuth();
        }
    }, [isLoaded, isAuthenticated, accessToken, refreshToken]);

    if (loading) return <PageLoading />;

    return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};
