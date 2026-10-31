"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import useAuthStore from "../hooks/store/use-auth-store";
import { IUser } from "../types/user";
import { PageLoading, PageSlowLoading } from "@/components";
import dynamic from "next/dynamic";
import { PUBLIC_ROUTES } from "@/constants/route";
import { ENV } from "@/config/env";
import { refreshAccessToken } from "@/utils/http-request";

export const AuthContext = createContext({});
export const useAuthContext = () => useContext(AuthContext);

const AuthContextProvider = ({ children }: { children: any }) => {
    const [isInitializing, setIsInitializing] = useState<boolean>(true);
    const [isShowSlowLoading, setIsShowSlowLoading] = useState<boolean>(false);

    const pathName = usePathname();
    const router = useRouter();

    const logout = async () => {
        const response = await fetch(`${ENV.API_BASE_URL}/auth/logout`, {
            method: "POST",
            credentials: "include",
        });

        if (response.status === 200) {
            useAuthStore.setState({
                currentUser: null,
                isAuthenticated: false,
            });

            router.push("/login");
        }
    };

    // Returns the refreshed user, or null when the refresh token is missing/invalid/revoked
    const refreshToken = async (): Promise<IUser | null> => {
        try {
            const response = await refreshAccessToken();
            return response.data.data as IUser;
        } catch (error: any) {
            console.error(error);
            return null;
        }
    };

    const handleAuthenticatedUser = (user: IUser) => {
        useAuthStore.setState({ currentUser: user, isAuthenticated: true });

        const isPublicRoute = PUBLIC_ROUTES.includes(pathName);

        if (user.isAdmin && isPublicRoute) {
            return router.push("/admin");
        }

        if (isPublicRoute) {
            return router.push("/");
        }
    };

    const handleUnauthenticatedUser = () => {
        const isPublicRoute = PUBLIC_ROUTES.includes(pathName);

        if (!isPublicRoute) {
            return router.push("/login");
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            let timeoutId: NodeJS.Timeout | null = null;

            try {
                timeoutId = setTimeout(() => {
                    setIsShowSlowLoading(true);
                }, 4000);

                const response = await fetch(`${ENV.API_BASE_URL}/auth/me`, {
                    credentials: "include",
                });
                const result = await response.json();
                const user = result.data as IUser;

                if (response.status === 200) {
                    return handleAuthenticatedUser(user);
                }

                // If user is not authenticated, redirect to login page
                if (response.status === 403) {
                    return handleUnauthenticatedUser();
                }

                // If the access token is expired, try to refresh it; if that fails the session is over
                if (response.status === 401) {
                    const refreshedUser = await refreshToken();

                    if (refreshedUser) {
                        return handleAuthenticatedUser(refreshedUser);
                    }

                    useAuthStore.setState({ currentUser: null, isAuthenticated: false });
                    return handleUnauthenticatedUser();
                }
            } catch (error: any) {
                console.error(error);
            } finally {
                if (timeoutId) clearTimeout(timeoutId);

                setIsInitializing(false);
                setIsShowSlowLoading(false);
            }
        };

        if (typeof window !== "undefined") {
            initializeAuth();
        }
    }, [pathName, router]);

    if (isInitializing) {
        if (isShowSlowLoading) {
            return <PageSlowLoading />;
        }

        return <PageLoading />;
    }

    return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};

export default dynamic(() => Promise.resolve(AuthContextProvider), { ssr: false });
