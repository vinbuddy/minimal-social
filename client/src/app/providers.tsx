"use client";

import useAuthStore from "@/libs/hooks/store/useAuthStore";
import { NextUIProvider } from "@nextui-org/react";
import { useState } from "react";

export function NextProvider({ children }: { children: React.ReactNode }) {
    return <NextUIProvider className="h-full">{children}</NextUIProvider>;
}

interface AuthClientAppProps {
    refreshToken: string | undefined;
    accessToken: string | undefined;
    children: any;
}
export function AuthClientApp({ accessToken, refreshToken, children }: AuthClientAppProps) {
    useState(() => {
        if (typeof window !== "undefined") {
            console.log("accessToken: ", accessToken);
            console.log("refreshToken: ", refreshToken);

            // Set auth store
            useAuthStore.setState((state) => ({ accessToken, refreshToken }));
        }
    });
    return <>{children}</>;
}
