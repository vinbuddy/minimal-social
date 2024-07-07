import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/MainLayout";
import { AuthClientApp, NextProvider as NextUIProvider } from "./providers";
import { Toaster } from "sonner";
import { AuthContextProvider } from "@/contexts/AuthContext";
import { cookies } from "next/headers";
import TokenRefresher from "@/components/TokenRefresher";

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
                        <AuthContextProvider>
                            {children}
                            <Toaster />
                            <TokenRefresher />
                        </AuthContextProvider>
                    </NextUIProvider>
                </AuthClientApp>
            </body>
        </html>
    );
}
