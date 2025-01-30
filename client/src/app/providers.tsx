"use client";

import { HeroUIProvider } from "@heroui/react";
import { SWRConfig } from "swr";
import { ThemeProvider as HeroUIThemesProvider } from "next-themes";
import { StreamVideoClient, StreamVideo } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";

import { fetcher } from "@/utils/http-request";
import { streamTokenProvider } from "./actions";
import PageLoading from "@/components/page-loading";
import { useAuthStore } from "@/hooks/store";

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

export function StreamProvider({ children }: { children: React.ReactNode }) {
    const [streamVideoClient, setStreamVideoClient] = useState<StreamVideoClient>();
    const { currentUser } = useAuthStore();

    useEffect(() => {
        if (!currentUser) return;

        const client = new StreamVideoClient({
            apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
            user: {
                id: currentUser._id,
                name: currentUser.username,
                image: currentUser.photo,
            },
            tokenProvider: streamTokenProvider,
        });
        console.log("client: ", client);

        setStreamVideoClient(client);
    }, [currentUser]);

    if (!streamVideoClient) return <PageLoading />;

    return <StreamVideo client={streamVideoClient}>{children}</StreamVideo>;
}
