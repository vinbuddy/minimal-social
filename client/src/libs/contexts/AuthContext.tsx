"use client";
import { createContext, useContext, useEffect, useState } from "react";
import useAuthStore from "../hooks/store/useAuthStore";
import axiosInstance from "@/utils/httpRequest";
import { usePathname, useRouter } from "next/navigation";
import { IUser } from "../types/user";
import axios from "axios";

export const AuthContext = createContext({});
export const useAuthContext = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }: { children: any }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const { currentUser, isAuthenticated, accessToken, refreshToken, isLoaded } = useAuthStore();

    const router = useRouter();
    const path = usePathname();

    const publicRoutes = ["/login", "/register", "/otp", "/forgot", "/register"];

    useEffect(() => {
        (async () => {
            // Fetch auth get me
            try {
                if (!isLoaded) return;

                if (!accessToken && !refreshToken && !publicRoutes.includes(path)) {
                    router.push("/login");
                    return;
                }
            } catch (error) {
                console.error(error);
                router.push("/login");
            }
        })();
    }, [isLoaded]);

    return <AuthContext.Provider value={{}}>{loading ? <></> : children}</AuthContext.Provider>;
};
