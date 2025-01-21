import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Conversation | Minimal Social",
};
export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
