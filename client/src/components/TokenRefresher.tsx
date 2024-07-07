"use client";
import useAuthStore from "@/hooks/store/useAuthStore";
import axiosInstance from "@/utils/httpRequest";
import { getTokenExpire, refreshAccessToken } from "@/utils/jwt";
import { deleteCookie, setCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const TEN_MINUTES = 10 * 60 * 1000;
const REFRESH_INTERVAL = TEN_MINUTES;

export default function TokenRefresher() {
    const { isLoaded, accessToken, refreshToken } = useAuthStore();
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

        const refreshExpireAt = getTokenExpire(refreshToken);
        if (refreshExpireAt && Date.now() >= refreshExpireAt) {
            logout();
            return;
        }

        if (!accessToken) return;

        const expireAt = getTokenExpire(accessToken);
        if (!expireAt) return;

        (async () => {
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
                return;
            }
        })();

        const interval = setInterval(async () => {
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
        }, REFRESH_INTERVAL);

        return () => {
            clearInterval(interval);
        };
    }, [isLoaded, accessToken, refreshToken, router]);

    return null;
}
