"use client";
import { Avatar, Button, Tooltip } from "@nextui-org/react";
import { InfoIcon, Phone, Video } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

import ConversationInfo from "@/components/Conversation/ConversationInfo";
import MessageForm from "@/components/Message/MessageForm";
import MessageList from "@/components/Message/MessageList";
import UserName from "@/components/User/UserName";

import { useAuthStore } from "@/hooks/store";
import { IConversation } from "@/types/conversation";

function ConversationDetailPage() {
    const [isOpenConversationInfo, setIsOpenConversationInfo] = useState<boolean>(false);
    const params = useParams<{ id: string }>();
    const currentUser = useAuthStore((state) => state.currentUser);

    const { data, error, isLoading } = useSWR<{ data: IConversation }>(`conversation/${params.id}`);

    const otherUser =
        data && currentUser && data?.data?.participants?.find((participant) => participant._id !== currentUser._id);

    return (
        <>
            <div className="grid grid-cols-12 h-full">
                <section
                    className={`col-span-12 sm:col-span-12 ${
                        isOpenConversationInfo
                            ? "md:col-span-8 lg:col-span-8 xl:col-span-8 2xl:col-span-8"
                            : "md:col-span-12 lg:col-span-12 xl:col-span-12 2xl:col-span-12"
                    }`}
                >
                    <div className="h-screen flex flex-col justify-between overflow-auto py-4">
                        {/* User - Actions */}
                        <header className="min-h-[40px] flex items-center justify-between pb-5 px-4  border-b-1 border-divider">
                            <div className="flex items-center cursor-pointer">
                                {/* <Badge content="" color="default" shape="circle" placement="bottom-right">
                                    <Avatar radius="full" src="https://i.pravatar.cc/150?u=a04258a2462d826712d" />
                                </Badge> */}
                                <Avatar radius="full" src={otherUser?.photo} />

                                <div className="ms-3">
                                    <UserName user={otherUser} className="font-semibold hover:no-underline" />
                                    {/* <p className="text-sm text-default-500">Online 4 minutes ago</p> */}
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
                                    <Button
                                        onPress={() => setIsOpenConversationInfo(!isOpenConversationInfo)}
                                        size="sm"
                                        isIconOnly
                                        color="default"
                                        variant={isOpenConversationInfo ? "flat" : "light"}
                                    >
                                        <InfoIcon size={18} />
                                    </Button>
                                </Tooltip>
                            </div>
                        </header>

                        {/* Message */}
                        {data?.data && <MessageList conversation={data?.data} />}

                        <MessageForm conversation={data?.data} />
                    </div>
                </section>
                {isOpenConversationInfo && (
                    <section className="col-span-12 sm:col-span-12 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                        <ConversationInfo />
                    </section>
                )}
            </div>
        </>
    );
}

export default ConversationDetailPage;
