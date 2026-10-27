import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Reels | Minimal Social",
};
export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
