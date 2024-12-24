"use client";

import Image from "next/image";
// import { useTheme } from "next-themes";
// import conversationBgDarkSvg from "../../../public/svgs/conversation-bg-dark.svg";
// import conversationBgLightSvg from "../../../public/svgs/conversation-bg-light.svg";

function ConversationPage() {
    return (
        <>
            <div className="h-screen flex flex-col justify-center items-center overflow-auto py-4 bg-white">
                <Image
                    className="rounded grayscale md:w-[500px] w-[240px]"
                    width={350}
                    height={350}
                    src="/images/conversation-gif-bg.gif"
                    // src={theme === "dark" ? conversationBgDarkSvg : conversationBgLightSvg}
                    alt="background"
                />
                <h1 className="text-3xl text-black mt-3 font-semibold">Welcome to Minimal Chat</h1>
            </div>
        </>
    );
}

export default ConversationPage;
