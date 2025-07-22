import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign in | Admin",
};
export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
