"use client";

import { HeroUIProvider } from "@heroui/react";
import { SWRConfig } from "swr";
import { ThemeProvider as HeroUIThemesProvider } from "next-themes";

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

export function HeroProvider({ children }: { children: React.ReactNode }) {
    return (
        <HeroUIProvider className="h-full">
            <HeroUIThemesProvider attribute="class" defaultTheme="light">
                {children}
            </HeroUIThemesProvider>
        </HeroUIProvider>
    );
}
