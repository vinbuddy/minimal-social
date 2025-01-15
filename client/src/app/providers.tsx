"use client";

import { NextUIProvider } from "@nextui-org/react";
import { SWRConfig } from "swr";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { fetcher } from "@/utils/http-request";

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
