import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import "./globals.css";

import { SocketProvider } from "@/contexts/socket-context";
import { HeroProvider as NextUIProvider, SWRConfigProvider } from "./providers";
import dynamic from "next/dynamic";
// import AuthContextProvider from "@/contexts/auth-context";

const AuthContextProvider = dynamic(() => import("@/contexts/auth-context"), {
    ssr: false,
});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Minimal Social",
    description: "A minimal social media platform",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="light scrollbar" suppressHydrationWarning>
            <body className={inter.className}>
                <AuthContextProvider>
                    <NextUIProvider>
                        <SWRConfigProvider>
                            <SocketProvider>
                                {children}
                                <Toaster />
                            </SocketProvider>
                        </SWRConfigProvider>
                    </NextUIProvider>
                </AuthContextProvider>
            </body>
        </html>
    );
}
