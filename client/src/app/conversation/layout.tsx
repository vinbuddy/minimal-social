import ConversationList from "@/components/conversation/conversation-list";
import MainLayout from "@/components/main-layout";

export default function ConversationLayout({ children }: { children: React.ReactNode }) {
    return (
        <MainLayout>
            <div className="grid grid-cols-12 h-full ps-[80px]">
                <section className="col-span-12 sm:col-span-12 md:col-span-3 lg:col-span-3 xl:col-span-3 2xl:col-span-3">
                    <ConversationList />
                </section>
                <section className="col-span-12 sm:col-span-12 md:col-span-9 lg:col-span-9 xl:col-span-9 2xl:col-span-9">
                    {children}
                </section>
            </div>
        </MainLayout>
    );
}
