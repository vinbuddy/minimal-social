"use client";
import ChatItem from "@/components/Conversation/ConversationItem";
import EmojiPicker from "@/components/EmojiPicker";
import MainLayout from "@/components/MainLayout";
import PostModalButton from "@/components/Post/PostModalButton";
import useAuthStore from "@/hooks/store/useAuthStore";
import axiosInstance from "@/utils/httpRequest";
import {
    Avatar,
    Badge,
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Input,
    Tab,
    Tabs,
    Tooltip,
} from "@nextui-org/react";
import { ImageIcon, PanelRight, PaperclipIcon, Phone, PlusIcon, Search, ThumbsUpIcon, Video } from "lucide-react";
import { useEffect } from "react";
function Home() {
    const currentUser = useAuthStore((state) => state.currentUser);

    useEffect(() => {
        (async () => {
            try {
                const res = await axiosInstance.get("/user");
                // console.log(getCookie("accessToken"));
                console.log("res: ", res.data);
                console.log("currentUser: ", currentUser);
            } catch (error) {
                console.log("error: ", error);
            }
        })();
    }, [currentUser]);
    return (
        <MainLayout>
            <div className="flex justify-center w-full">
                <div className="min-w-[630px]">
                    <header className="sticky top-0 p-4 flex justify-between items-center">
                        <Tabs color="default" aria-label="Tabs colors" radius="md">
                            <Tab key="feed" title="Feed" />
                            <Tab key="following" title="Following" />
                            <Tab key="liked" title="Liked" />
                        </Tabs>

                        <PostModalButton />
                    </header>

                    <div className="min-h-[4000px]"></div>
                </div>
            </div>
        </MainLayout>
    );
}

export default Home;
