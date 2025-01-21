import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign up | Minimal Social",
};
export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
