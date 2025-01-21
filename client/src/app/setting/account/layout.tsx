import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Account settings",
};
export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
