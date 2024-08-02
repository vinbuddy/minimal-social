"use client";
import EmojiPicker from "@/components/EmojiPicker";
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
    Tooltip,
} from "@nextui-org/react";
import { ImageIcon, PanelRight, PaperclipIcon, Phone, PlusIcon, ThumbsUpIcon, Video } from "lucide-react";
import { useEffect } from "react";
function ConversationPage() {
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
        <>
            <div className="h-screen flex flex-col justify-between overflow-auto py-4">
                {/* User - Actions */}
                <header className="min-h-[40px] flex items-center justify-between pb-5 px-4  border-b-1 border-divider">
                    <div className="flex items-center">
                        <Badge content="" color="default" shape="circle" placement="bottom-right">
                            <Avatar radius="full" src="https://i.pravatar.cc/150?u=a04258a2462d826712d" />
                        </Badge>
                        <div className="ms-3">
                            <h3 className="font-semibold">Min</h3>
                            <p className="text-sm text-default-500">Online 4 minutes ago</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Tooltip content="Call">
                            <Button size="sm" isIconOnly color="default" variant="light">
                                <Phone size={18} />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Video call">
                            <Button size="sm" isIconOnly color="default" variant="light">
                                <Video size={18} />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Chat info">
                            <Button size="sm" isIconOnly color="default" variant="light">
                                <PanelRight size={18} />
                            </Button>
                        </Tooltip>
                    </div>
                </header>

                {/* Message */}
                <div className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col p-4 scrollbar"></div>

                {/* Chat bar */}
                <div className="flex items-center gap-x-2 px-4">
                    <Dropdown placement="bottom">
                        <DropdownTrigger>
                            <Button isIconOnly color="primary" size="sm" radius="full">
                                <PlusIcon size={18} />
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu variant="flat">
                            <DropdownItem startContent={<ImageIcon size={16} />} key="image">
                                Send image
                            </DropdownItem>
                            <DropdownItem startContent={<PaperclipIcon size={16} />} key="file">
                                Send files
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>

                    <div className="flex-1 flex items-center justify-between rounded-full  border-default border bg-background px-1">
                        <textarea
                            className="flex-1 outline-none px-4 py-3 h-11 transition-all text-sm placeholder:text-muted-foreground bg-background disabled:cursor-not-allowed disabled:opacity-50 w-full rounded-full resize-none overflow-y-auto"
                            autoComplete="off"
                            name="message"
                            placeholder="Aa"
                        ></textarea>

                        <EmojiPicker
                            onChange={(value: string) => {
                                console.log(value);
                            }}
                        />
                    </div>
                    <Button isIconOnly variant="light" radius="full">
                        <ThumbsUpIcon size={18} />
                    </Button>
                    {/* <Button isIconOnly variant="light" radius="full">
                            <SendHorizonalIcon size={18} />
                        </Button> */}
                </div>
            </div>
        </>
    );
}

export default ConversationPage;
