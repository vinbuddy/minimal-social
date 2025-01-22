"use client";
import cn from "classnames";

import ConversationList from "@/components/conversation/conversation-list";
import MainLayout from "@/layouts/main-layout";
import { useBreakpoint, useItemClick } from "@/hooks";
import { IConversation } from "@/types/conversation";
import { ConversationContext } from "@/contexts/conversation-context";

export default function ConversationLayout({ children }: { children: React.ReactNode }) {
    const breakpoint = useBreakpoint();
    const { item: itemClicked, onItemClick } = useItemClick<IConversation>();

    const handleBack = () => {
        onItemClick(null);
    };

    return (
        <MainLayout>
            <ConversationContext.Provider value={{ onBack: handleBack, conversationItem: itemClicked }}>
                <div className="grid grid-cols-12 h-full ps-0 md:ps-[80px]">
                    <section
                        className={cn(
                            "col-span-12 sm:col-span-12 md:col-span-3 lg:col-span-3 xl:col-span-3 2xl:col-span-3",
                            {
                                hidden: breakpoint === "mobile" && itemClicked !== null,
                            }
                        )}
                    >
                        <ConversationList onConversationClick={onItemClick} />
                    </section>
                    <section
                        className={cn(
                            "col-span-12 sm:col-span-12 md:col-span-9 lg:col-span-9 xl:col-span-9 2xl:col-span-9",
                            {
                                hidden: breakpoint === "mobile" && itemClicked === null,
                            }
                        )}
                    >
                        {children}
                    </section>
                </div>
            </ConversationContext.Provider>
        </MainLayout>
    );
}
