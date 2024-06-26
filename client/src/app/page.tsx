"use client";
import ChatItem from "@/components/Chat/ChatItem";
import EmojiPicker from "@/components/EmojiPicker";
import MainLayout from "@/components/MainLayout";
import { Avatar, Badge, Button, Input, Tooltip, User } from "@nextui-org/react";
import { Info, PanelRight, Phone, Search, SendHorizonalIcon, SmileIcon, ThumbsUpIcon, Video } from "lucide-react";

export default function Home() {
    return (
        <MainLayout>
            <div className="grid grid-cols-12 h-full">
                <section className="col-span-12 sm:col-span-12 md:col-span-3 lg:col-span-3 xl:col-span-3 2xl:col-span-3">
                    <div className="h-screen overflow-auto border-r-1 border-divider px-4 pb-4 scrollbar">
                        <div className="sticky top-0 pt-4 bg-background z-10">
                            <header className="h-[40px] flex items-center mb-5">
                                <h1 className="font-bold text-xl">Chat</h1>
                            </header>
                            <Input
                                isClearable
                                classNames={{
                                    base: "w-full",
                                    inputWrapper: "border-1 border-divider",
                                }}
                                defaultValue={""}
                                placeholder="Search..."
                                size="md"
                                variant="flat"
                                radius="lg"
                                startContent={<Search size={18} />}
                                type="text"
                            />
                        </div>

                        {/* chat list */}
                        <div className="mt-5">
                            {Array.from({ length: 18 }).map((_, index) => (
                                <div className="" key={index}>
                                    <ChatItem />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                <section className="col-span-12 sm:col-span-12 md:col-span-9 lg:col-span-9 xl:col-span-9 2xl:col-span-9">
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
                        <div className="px-4">
                            <div className="flex items-center justify-between rounded-full  border-default border bg-background px-1">
                                <EmojiPicker
                                    onChange={(value: string) => {
                                        console.log(value);
                                    }}
                                />
                                <textarea
                                    className="flex-1 outline-none ps-1 pe-4 py-3 h-11 transition-all text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 w-full rounded-full resize-none overflow-y-auto"
                                    autoComplete="off"
                                    name="message"
                                    placeholder="Aa"
                                ></textarea>

                                {/* <Button isIconOnly variant="light" radius="full">
                                    <ThumbsUpIcon size={18} />
                                </Button> */}
                                <Button isIconOnly variant="light" radius="full">
                                    <SendHorizonalIcon size={18} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
