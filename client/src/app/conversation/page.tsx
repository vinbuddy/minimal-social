"use client";

import conversationBg from "@/assets/images/conversation-bg.jpg";
import Image from "next/image";

function ConversationPage() {
    return (
        <>
            <div className="h-screen flex flex-col justify-center items-center overflow-auto py-4">
                <Image
                    className="rounded-2xl grayscale"
                    width={300}
                    height={300}
                    src={conversationBg}
                    alt="background"
                />
                <h1 className="text-xl mt-3 font-semibold">Select a conversation to start messaging</h1>
            </div>
        </>
    );
}

export default ConversationPage;
