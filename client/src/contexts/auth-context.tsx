"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import useAuthStore from "../hooks/store/use-auth-store";
import { IUser } from "../types/user";
import PageLoading from "@/components/page-loading";

export const AuthContext = createContext({});
export const useAuthContext = () => useContext(AuthContext);

const AuthContextProvider = ({ children }: { children: any }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [initialized, setInitialized] = useState<boolean>(false);
    const { currentUser } = useAuthStore();

    const pathName = usePathname();
    const router = useRouter();

    const logout = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
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

    const refreshToken = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });
            const result = await response.json();

            if (response.status === 200) {
                const user = result.data as IUser;
                useAuthStore.setState({ currentUser: user, isAuthenticated: true });
            }

            if (response.status === 403) {
                await logout();
            }
        } catch (error: any) {
            console.error(error);
            useAuthStore.setState({ currentUser: null, isAuthenticated: false });
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            if (initialized) return;
            try {
                setLoading(true);

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
                    credentials: "include",
                });
                const result = await response.json();

                if (response.status === 200) {
                    const user = result.data as IUser;
                    useAuthStore.setState({ currentUser: user, isAuthenticated: true });

                    if (pathName === "/login" || pathName === "/register") {
                        router.push("/");
                    }

                    return;
                }

                if (response.status === 401) {
                    await refreshToken();
                }
            } catch (error: any) {
                console.error(error);
                // useAuthStore.setState({ currentUser: null, isAuthenticated: false });
            } finally {
                setLoading(false);
            }
        };

        if (typeof window !== "undefined") {
            initializeAuth();
        }
    }, [initialized, pathName, router]);

    if (loading) return <PageLoading />;

    return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};

// export default dynamic(() => Promise.resolve(AuthContextProvider), { ssr: false });
export default AuthContextProvider;
