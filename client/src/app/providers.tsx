"use client";

import { NextUIProvider } from "@nextui-org/react";
import { useEffect } from "react";
import { SWRConfig } from "swr";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { useAuthStore } from "@/hooks/store";
import { fetcher } from "@/utils/httpRequest";

export function SWRConfigProvider({ children }: { children: React.ReactNode }) {
    return (
        <SWRConfig
            value={{
                fetcher: fetcher,
                revalidateOnFocus: false,
                revalidateOnReconnect: false,
                refreshWhenOffline: false,
                refreshWhenHidden: false,
                refreshInterval: 0,
            }}
        >
            {children}
        </SWRConfig>
    );
}

export function NextProvider({ children }: { children: React.ReactNode }) {
    return (
        <NextUIProvider className="h-full">
            <NextThemesProvider attribute="class" defaultTheme="light">
                {children}
            </NextThemesProvider>
        </NextUIProvider>
    );
}

interface AuthClientAppProps {
    refreshToken: string | undefined;
    accessToken: string | undefined;
    children: any;
}
export function AuthClientApp({ accessToken, refreshToken, children }: AuthClientAppProps) {
    useEffect(() => {
        if (typeof window !== "undefined") {
            useAuthStore.setState((state) => ({
                accessToken,
                refreshToken,
                isLoaded: true,
            }));
        }
    }, [accessToken, refreshToken]);

    return <>{children}</>;
}
