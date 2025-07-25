"use client";

import { Dropdown, DropdownMenu, DropdownItem, DropdownTrigger, DropdownSection, useDisclosure } from "@heroui/react";
import { BanIcon, FlagTriangleRightIcon, HeartHandshakeIcon, LogOutIcon, SettingsIcon, ShareIcon } from "lucide-react";

import { IUser } from "@/types/user";
import { useCopyToClipboard, useGlobalMutation, useIsOwner, useLoading } from "@/hooks";
import ConfirmationModal from "../confirmation-modal";
import axiosInstance from "@/utils/http-request";
import { showToast } from "@/utils/toast";
import { useState } from "react";
import { useAuthStore } from "@/hooks/store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface IProps {
    children: React.ReactNode;
    user: IUser;
}

export default function ProfileMenuDropdown({ children, user }: IProps) {
    const copy = useCopyToClipboard();
    const isOwner = useIsOwner(user._id);
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const { currentUser } = useAuthStore();
    const mutation = useGlobalMutation();
    const { t: tUser } = useTranslation("user");
    const { t } = useTranslation("common");

    const [isBlocked, setIsBlocked] = useState<boolean>(() => {
        return currentUser?.blockedUsers.some((blockedUser) => blockedUser._id === user._id) ?? false;
    });
    const { startLoading, stopLoading } = useLoading();

    const router = useRouter();

    const handleBlock = async () => {
        try {
            await axiosInstance.put(`/account/block/${user._id}`);

            showToast(`Blocked ${user.username}`, "success");
            setIsBlocked(true);

            // If following or follower, remove from followings and followers
            const isFollowing = currentUser?.followings.some((userId) => userId === user._id);
            const isFollower = currentUser?.followers.some((userId) => userId === user._id);

            const updatedCurrentUser = { ...currentUser };

            if (isFollowing) {
                updatedCurrentUser.followings =
                    updatedCurrentUser?.followings?.filter((userId) => userId !== user._id) ?? [];
            }

            if (isFollower) {
                updatedCurrentUser.followers =
                    updatedCurrentUser?.followers?.filter((userId) => userId !== user._id) ?? [];
            }

            updatedCurrentUser.blockedUsers?.push(user);

            useAuthStore.setState((state) => ({
                currentUser: updatedCurrentUser as IUser,
            }));

            mutation((key) => typeof key === "string" && key.includes("/user"));
        } catch (error: any) {
            showToast(error.response.data.message ?? error.message, "error");
        } finally {
            onClose();
        }
    };

    const handleUnblock = async () => {
        try {
            await axiosInstance.put(`/account/unblock/${user._id}`);

            showToast(`Unblocked ${user.username}`, "success");
            setIsBlocked(false);

            const updatedCurrentUser = { ...currentUser };

            updatedCurrentUser.blockedUsers =
                updatedCurrentUser?.blockedUsers?.filter((blockedUser) => blockedUser._id !== user._id) ?? [];

            useAuthStore.setState((state) => ({
                currentUser: updatedCurrentUser as IUser,
            }));

            mutation((key) => typeof key === "string" && key.includes("/user"));
        } catch (error: any) {
            showToast(error.response.data.message ?? error.message, "error");
        } finally {
            onClose();
        }
    };

    const handleLogOut = async (): Promise<void> => {
        try {
            startLoading();

            const response = await axiosInstance.post("/auth/logout");

            if (response.status === 200) {
                useAuthStore.setState({
                    currentUser: null,
                    isAuthenticated: false,
                    accessToken: undefined,
                    refreshToken: undefined,
                });

                router.push("/login");

                showToast("Logout successfully", "success");
            }
        } catch (error: any) {
            showToast(error?.response?.data?.message || "An error occurred", "error");
        } finally {
            stopLoading();
        }
    };

    return (
        <>
            <ConfirmationModal
                title={tUser("USER.BLOCK_UNBLOCK_ACTION", {
                    action: isBlocked ? tUser("USER.UNBLOCK") : tUser("USER.BLOCK"),
                    username: user.username,
                })}
                description={
                    isBlocked ? null : (
                        <span className="text-default-500">
                            {tUser("USER.BLOCK.NOTE_1", { username: user.username })} <br />
                            <ul className="list-disc pl-5 py-2">
                                <li>{tUser("USER.BLOCK.NOTE_LIST_1")}</li>
                                <li>{tUser("USER.BLOCK.NOTE_LIST_2")}</li>
                                <li>{tUser("USER.BLOCK.NOTE_LIST_3")}</li>
                                <li>{tUser("USER.BLOCK.NOTE_LIST_4")}</li>
                                <li>{tUser("USER.BLOCK.NOTE_LIST_5")}</li>
                                <li>{tUser("USER.BLOCK.NOTE_LIST_6")}</li>
                            </ul>
                            {tUser("USER.BLOCK.NOTE_2", { username: user.username })}
                        </span>
                    )
                }
                icon={isBlocked ? <HeartHandshakeIcon size={24} /> : <BanIcon size={24} />}
                iconBgColor={isBlocked ? "#000" : undefined}
                iconColor={isBlocked ? "#fff" : undefined}
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                onOk={isBlocked ? handleUnblock : handleBlock}
                okButtonProps={{ color: isBlocked ? "primary" : "danger" }}
                okButtonContent={
                    isBlocked ? (
                        <span className="first-letter:uppercase">{tUser("USER.UNBLOCK")}</span>
                    ) : (
                        <span className="first-letter:uppercase">{tUser("USER.BLOCK")}</span>
                    )
                }
                onClose={onClose}
            />

            <Dropdown placement="bottom-end">
                <DropdownTrigger>{children}</DropdownTrigger>
                {isOwner ? (
                    <DropdownMenu variant="flat" aria-label="Static Actions">
                        <DropdownSection aria-label="setting" showDivider>
                            <DropdownItem
                                startContent={<SettingsIcon size={16} />}
                                key="setting"
                                href="/setting/account"
                                as={Link}
                            >
                                {tUser("USER.SETTING")}
                            </DropdownItem>
                            <DropdownItem
                                startContent={<ShareIcon size={16} />}
                                key="share"
                                onPress={() => copy(`${window.location.origin}/user/${user._id}`)}
                            >
                                {tUser("USER.SHARE_PROFILE")}
                            </DropdownItem>
                        </DropdownSection>
                        <DropdownItem
                            color="danger"
                            className="text-danger"
                            startContent={<LogOutIcon size={16} />}
                            key="logout"
                            onPress={handleLogOut}
                        >
                            {t("LOGOUT")}
                        </DropdownItem>
                    </DropdownMenu>
                ) : (
                    <DropdownMenu variant="flat" aria-label="Static Actions">
                        <DropdownSection aria-label="user" showDivider>
                            <DropdownItem
                                startContent={<ShareIcon size={16} />}
                                key="share"
                                onPress={() => copy(`${window.location.origin}/user/${user._id}`)}
                            >
                                {tUser("USER.SHARE_PROFILE")}
                            </DropdownItem>
                        </DropdownSection>
                        <DropdownItem
                            color="danger"
                            className="text-danger"
                            startContent={<BanIcon size={16} />}
                            key="block"
                            onPress={onOpen}
                        >
                            {isBlocked ? tUser("USER.UNBLOCK_USER") : tUser("USER.BLOCK_USER")}
                        </DropdownItem>
                        <DropdownItem
                            color="danger"
                            className="text-danger"
                            startContent={<FlagTriangleRightIcon size={16} />}
                            key="report"
                        >
                            {tUser("USER.REPORT_USER")}
                        </DropdownItem>
                    </DropdownMenu>
                )}
            </Dropdown>
        </>
    );
}
