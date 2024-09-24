"use client";
import useAuthStore from "@/hooks/store/useAuthStore";
import axiosInstance from "@/utils/httpRequest";
import { getTokenExpire, refreshAccessToken } from "@/utils/jwt";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";
import PageLoading from "./PageLoading";

const TEN_MINUTES = 10 * 60 * 1000;
const REFRESH_INTERVAL = TEN_MINUTES;

export default function TokenRefresher({ children }: { children: ReactNode }) {
    const { isLoaded, accessToken, refreshToken } = useAuthStore();
    const [hasRefreshedInitially, setHasRefreshedInitially] = useState<boolean>(false);
    const [isRefreshingToken, setIsRefreshingToken] = useState<boolean>(false);
    const router = useRouter();

    const logout = async () => {
        try {
            await axiosInstance.post("/auth/logout");
        } catch (error) {
            console.error("Failed to logout", error);
        }

        useAuthStore.setState({
            currentUser: null,
            isAuthenticated: false,
            accessToken: undefined,
            refreshToken: undefined,
        });

        toast.message("Session expired, please login again");

        router.push("/login");
    };

    useEffect(() => {
        if (!isLoaded || !refreshToken) return;

        const refreshTokenIfNeeded = async () => {
            setIsRefreshingToken(true);

            const refreshExpireAt = getTokenExpire(refreshToken);
            if (refreshExpireAt && Date.now() >= refreshExpireAt) {
                logout();
                return;
            }

            if (!accessToken) return;

            const expireAt = getTokenExpire(accessToken);
            if (!expireAt) return;

            if (!accessToken && refreshToken) {
                const { newAccessToken, newRefreshToken } = await refreshAccessToken();

                useAuthStore.setState({
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                    isAuthenticated: true,
                });
            }

            if (Date.now() >= expireAt) {
                const { newAccessToken, newRefreshToken } = await refreshAccessToken();

                useAuthStore.setState({
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                    isAuthenticated: true,
                });
            }
            setHasRefreshedInitially(true);
            setIsRefreshingToken(false);

            const now = new Date().getTime();
            const timeLeft = expireAt - now;

            if (timeLeft <= TEN_MINUTES) {
                const { newAccessToken, newRefreshToken } = await refreshAccessToken();

                useAuthStore.setState({
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                    isAuthenticated: true,
                });
            }
        };

        const interval = setInterval(refreshTokenIfNeeded, REFRESH_INTERVAL);

        return () => clearInterval(interval);
    }, [isLoaded, refreshToken, router]);

    if (isRefreshingToken && !hasRefreshedInitially) {
        return <PageLoading />;
    }

    return children;
}
