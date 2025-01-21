import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Forgot password | Minimal Social",
};
export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
