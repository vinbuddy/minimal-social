import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Search | Minimal Social",
};
export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
