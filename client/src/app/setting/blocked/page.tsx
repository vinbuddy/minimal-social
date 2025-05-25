"use client";

import ConfirmationModal from "@/components/confirmation-modal";
import ErrorMessage from "@/components/error-message";
import ScreenCenterWrapper from "@/components/screen-center-wrapper";
import UserItem from "@/components/user/user-item";
import UserSkeletons from "@/components/user/user-skeletons";
import { useGlobalMutation, usePagination } from "@/hooks";
import { useAuthStore } from "@/hooks/store";
import { IUser } from "@/types/user";
import axiosInstance from "@/utils/http-request";
import { showToast } from "@/utils/toast";
import { Button, Spinner, useDisclosure } from "@heroui/react";
import { HeartHandshakeIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import InfiniteScroll from "react-infinite-scroll-component";

export default function BlockedPage() {
    const [clickedUser, setClickedUser] = useState<IUser | null>(null);
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

    const {
        data: users,
        loadingMore,
        error,
        isReachedEnd,
        size,
        isLoading,
        setSize: setPage,
    } = usePagination<IUser>("/account/blocked");
    const mutation = useGlobalMutation();
    const { currentUser } = useAuthStore();
    const { t: tUser } = useTranslation("user");

    const handleUnblock = async () => {
        try {
            if (!clickedUser) throw new Error("User not found");

            await axiosInstance.put(`/account/unblock/${clickedUser._id}`);

            showToast(`${tUser("USER.UNBLOCK")} ${clickedUser.username}`, "success");

            const updatedCurrentUser = { ...currentUser };

            updatedCurrentUser.blockedUsers =
                updatedCurrentUser?.blockedUsers?.filter((blockedUser) => blockedUser._id !== clickedUser._id) ?? [];

            useAuthStore.setState((state) => ({
                currentUser: updatedCurrentUser as IUser,
            }));

            mutation((key) => typeof key === "string" && key.includes("/account"));
        } catch (error: any) {
            showToast(error.response.data.message ?? error.message, "error");
        } finally {
            onClose();
        }
    };

    if (error && !isLoading) {
        return (
            <ScreenCenterWrapper>
                <ErrorMessage error={error} />
            </ScreenCenterWrapper>
        );
    }

    return (
        <div className="flex justify-center">
            <ConfirmationModal
                title={tUser("USER.SETTING.UNBLOCK_CONFIRMATION", { username: clickedUser?.username })}
                description={null}
                icon={<HeartHandshakeIcon size={24} />}
                iconBgColor="#000"
                iconColor="#fff"
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                onOk={handleUnblock}
                okButtonProps={{ color: "primary" }}
                okButtonContent={<span className="first-letter:uppercase">{tUser("USER.UNBLOCK")}</span>}
                onClose={onClose}
            />

            <div className="w-full md:max-w-xl">
                <h1 className="text-xl font-medium mb-5">{tUser("USER.SETTING.BLOCKED_USER")}</h1>

                <InfiniteScroll
                    scrollableTarget="post-activity"
                    next={() => setPage(size + 1)}
                    hasMore={!isReachedEnd}
                    loader={
                        <div>
                            <UserSkeletons length={5} isShowedFollowButton={false} />
                        </div>
                    }
                    dataLength={users?.length ?? 0}
                >
                    {users.map((user) => (
                        <div
                            key={user?._id}
                            className="flex items-center justify-between border-b border-default last:border-none py-2"
                        >
                            <UserItem className="flex-1 border-none" user={user} isShowedFollowButton={false} />

                            <Button
                                size="sm"
                                variant="ghost"
                                onPress={() => {
                                    setClickedUser(user);
                                    onOpen();
                                }}
                            >
                                <span className="first-letter:uppercase"> {tUser("USER.UNBLOCK")}</span>
                            </Button>
                        </div>
                    ))}
                </InfiniteScroll>
            </div>
        </div>
    );
}
