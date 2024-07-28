"use client";
import MainLayout from "@/components/MainLayout";
import FollowButton from "@/components/User/FollowButton";
import UserName from "@/components/User/UserName";
import useAuthStore from "@/hooks/store/useAuthStore";
import { IUser } from "@/types/user";
import { Avatar, Button, Card, Tab, Tabs } from "@nextui-org/react";
import { useParams } from "next/navigation";
import useSWR from "swr";

export default function ProfilePage() {
    const params = useParams() as { id: string };
    const { currentUser } = useAuthStore();

    const { data: user, isLoading, error } = useSWR<{ data: IUser }>(`/user/${params.id}`);

    return (
        <MainLayout>
            <div className="flex justify-center w-full">
                <div className="w-[630px]">
                    <main className="px-4 py-5">
                        <section className="flex items-center gap-10">
                            <Avatar
                                isBordered
                                src={user?.data?.photo}
                                size="lg"
                                classNames={{
                                    base: "!size-36 !ring-offset-4",
                                }}
                            />

                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <UserName className="text-2xl justify-center" user={user?.data} />
                                    {user && user?.data?._id !== currentUser?._id ? (
                                        <FollowButton
                                            buttonProps={{ size: "md", radius: "md", fullWidth: false }}
                                            user={user?.data}
                                        />
                                    ) : (
                                        <Button variant="flat">Edit profile</Button>
                                    )}
                                </div>

                                <div className="flex gap-4 my-2">
                                    <p>
                                        {user?.data?.followers.length}{" "}
                                        <span className="text-default-500">followers</span>
                                    </p>
                                    <p>
                                        {user?.data?.followings.length}{" "}
                                        <span className="text-default-500">following</span>
                                    </p>
                                </div>

                                <p className="text-default-500">{user?.data?.bio}</p>
                            </div>
                        </section>
                        <section className="mt-10">
                            <Tabs
                                variant="underlined"
                                color="default"
                                fullWidth
                                size="lg"
                                classNames={{
                                    tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                                    cursor: "w-full bg-primary",
                                    tab: "h-12",
                                }}
                            >
                                <Tab key="post" title="Posts" />
                                <Tab key="repost" title="Reposts" />
                            </Tabs>
                        </section>
                    </main>
                </div>
            </div>
        </MainLayout>
    );
}
