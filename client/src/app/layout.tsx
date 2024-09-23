import { cookies } from "next/headers";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

import TokenRefresher from "@/components/TokenRefresher";
import { SocketProvider } from "@/contexts/SocketContext";
import { AuthClientApp, NextProvider as NextUIProvider, SWRConfigProvider } from "./providers";

const AuthContextProvider = dynamic(() => import("@/contexts/AuthContext").then((mod) => mod.AuthContextProvider), {
    ssr: false,
});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Minimal Social",
    description: "Generated by create next app",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="light" suppressHydrationWarning>
            <body className={inter.className}>
                <AuthClientApp
                    accessToken={cookies().get("accessToken")?.value}
                    refreshToken={cookies().get("refreshToken")?.value}
                >
                    <NextUIProvider>
                        <SWRConfigProvider>
                            <AuthContextProvider>
                                <SocketProvider>
                                    <TokenRefresher>
                                        {children}
                                        <Toaster />
                                    </TokenRefresher>
                                    {/* <TokenRefresher /> */}
                                </SocketProvider>
                            </AuthContextProvider>
                        </SWRConfigProvider>
                    </NextUIProvider>
                </AuthClientApp>
            </body>
        </html>
    );
}
