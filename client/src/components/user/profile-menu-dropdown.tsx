"use client";

import {
    Dropdown,
    DropdownMenu,
    DropdownItem,
    DropdownTrigger,
    DropdownSection,
    useDisclosure,
} from "@heroui/react";
import { BanIcon, FlagTriangleRightIcon, HeartHandshakeIcon, LogOutIcon, SettingsIcon, ShareIcon } from "lucide-react";

import { IUser } from "@/types/user";
import { useCopyToClipboard, useGlobalMutation, useIsOwner } from "@/hooks";
import ConfirmationModal from "../confirmation-modal";
import axiosInstance from "@/utils/http-request";
import { showToast } from "@/utils/toast";
import { useState } from "react";
import { useAuthStore } from "@/hooks/store";

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

    const [isBlocked, setIsBlocked] = useState<boolean>(() => {
        return currentUser?.blockedUsers.some((blockedUser) => blockedUser._id === user._id) ?? false;
    });

    const handleBlock = async () => {
        try {
            await axiosInstance.put(`/user/block/${user._id}`);

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
            await axiosInstance.put(`/user/unblock/${user._id}`);

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

    return (
        <>
            <ConfirmationModal
                title={`You want to ${isBlocked ? "unblock" : "block"} ${user.username} ?`}
                description={
                    isBlocked ? null : (
                        <span className="text-default-500">
                            {user.username} will not be able to: <br />
                            <ul className="list-disc pl-5 py-2">
                                <li>See your profile</li>
                                <li>Follow you</li>
                                <li>Send you messages</li>
                                <li>Comment on your posts</li>
                                <li>Tag you</li>
                                <li>See posts on your timeline</li>
                            </ul>
                            If you followed, blocking {user.username} will also unfollow him.
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
                okButtonContent={isBlocked ? "Unblock" : "Block"}
                onClose={onClose}
            />

            <Dropdown placement="bottom-end">
                <DropdownTrigger>{children}</DropdownTrigger>
                {isOwner ? (
                    <DropdownMenu variant="flat" aria-label="Static Actions">
                        <DropdownSection aria-label="setting" showDivider>
                            <DropdownItem startContent={<SettingsIcon size={16} />} key="setting">
                                Settings
                            </DropdownItem>
                            <DropdownItem
                                startContent={<ShareIcon size={16} />}
                                key="share"
                                onPress={() => copy(`${window.location.origin}/user/${user._id}`)}
                            >
                                Share profile link
                            </DropdownItem>
                        </DropdownSection>
                        <DropdownItem
                            color="danger"
                            className="text-danger"
                            startContent={<LogOutIcon size={16} />}
                            key="logout"
                        >
                            Logout
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
                                Share profile link
                            </DropdownItem>
                        </DropdownSection>
                        <DropdownItem
                            color="danger"
                            className="text-danger"
                            startContent={<BanIcon size={16} />}
                            key="block"
                            onPress={onOpen}
                        >
                            {isBlocked ? "Unblock user" : "Block user"}
                        </DropdownItem>
                        <DropdownItem
                            color="danger"
                            className="text-danger"
                            startContent={<FlagTriangleRightIcon size={16} />}
                            key="report"
                        >
                            Report user
                        </DropdownItem>
                    </DropdownMenu>
                )}
            </Dropdown>
        </>
    );
}
