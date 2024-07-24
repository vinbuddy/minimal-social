"use client";
import { CommentIcon, HeartIcon, RepostIcon } from "@/assets/icons";
import MainLayout from "@/components/MainLayout";
import { Tab, Tabs } from "@nextui-org/react";
import { AtSignIcon, UserIcon } from "lucide-react";

export default function NotificationPage() {
    return (
        <MainLayout>
            <div className="flex justify-center w-full">
                <div className="w-[630px]">
                    <header className="sticky top-0 z-10 p-4 flex justify-center items-center bg-background">
                        <Tabs variant="light" color="default" radius="full">
                            <Tab key="all" title="All" />
                            <Tab
                                key="like"
                                title={
                                    <div className="flex items-center gap-2">
                                        <HeartIcon size={18} />
                                        <span>Like</span>
                                    </div>
                                }
                            />
                            <Tab
                                key="follow"
                                title={
                                    <div className="flex items-center gap-2">
                                        <UserIcon size={18} />
                                        <span>Follow</span>
                                    </div>
                                }
                            />
                            <Tab
                                key="comment"
                                title={
                                    <div className="flex items-center gap-2">
                                        <CommentIcon size={18} />
                                        <span>Comment</span>
                                    </div>
                                }
                            />
                            <Tab
                                key="mention"
                                title={
                                    <div className="flex items-center gap-2">
                                        <AtSignIcon size={18} />
                                        <span>Mention</span>
                                    </div>
                                }
                            />
                            <Tab
                                key="repost"
                                title={
                                    <div className="flex items-center gap-2">
                                        <RepostIcon size={18} />
                                        <span>Repost</span>
                                    </div>
                                }
                            />
                        </Tabs>
                    </header>

                    <main className="px-4 pb-4"></main>
                </div>
            </div>
        </MainLayout>
    );
}
