import { INotification } from "@/types/notification";
import NotificationThumbnail from "./NotificationThumbnail";
import Link from "next/link";
import { Avatar, AvatarGroup, Button, useDisclosure } from "@nextui-org/react";
import { EllipsisIcon, LoaderIcon, TrashIcon } from "lucide-react";
import TimeAgo from "../TimeAgo";
import UserName from "../User/UserName";
import ConfirmationModal from "../ConfirmationModal";
import axiosInstance from "@/utils/httpRequest";
import { useState } from "react";
import { toast } from "sonner";
import { TOAST_OPTIONS } from "@/utils/toast";
import useLoading from "@/hooks/useLoading";
import useGlobalMutation from "@/hooks/useGlobalMutation";

interface IProps {
    notification: INotification;
}

export default function NotificationItem({ notification }: IProps) {
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const { startLoading, stopLoading, loading } = useLoading();
    const mutate = useGlobalMutation();

    const others = notification?.senders?.length - 1;
    const totalNotifications = notification?.senders?.length;

    const handleDeleteNotification = async () => {
        try {
            startLoading();
            const res = await axiosInstance.delete(`/notification/${notification?._id}`);

            mutate((key) => typeof key === "string" && key.includes("/notification"));

            toast.success("Delete notification successfully", TOAST_OPTIONS);
        } catch (error) {
            console.error(error);

            toast.error("Delete notification failed", TOAST_OPTIONS);
        } finally {
            stopLoading();
        }
    };

    return (
        <>
            <ConfirmationModal
                title="Are you sure you want to delete this notification ?"
                description=""
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                onOk={handleDeleteNotification}
            />
            <div className="group flex items-center justify-between py-5 border-b border-divider last:border-none ps-1">
                <Link href={notification?.url ?? "#"} className="flex flex-1 gap-5">
                    <NotificationThumbnail photo={notification?.photo} action={notification?.action} />
                    <div className="w-full">
                        <h4>
                            <Link href={`/profile/${notification?.senders[0]?._id}`} className="font-semibold">
                                <UserName className="inline-flex" user={notification?.senders[0]} />
                            </Link>{" "}
                            {notification?.senders && totalNotifications > 1 && <span>and {others} others&nbsp;</span>}
                            <span>{notification?.message}</span>
                        </h4>
                        <div className="">
                            <TimeAgo className="!text-default-400 !text-sm" date={notification?.createdAt} />
                        </div>

                        {notification?.senders?.length > 1 && (
                            <AvatarGroup
                                className="mt-2"
                                isDisabled
                                max={3}
                                total={totalNotifications ?? 0}
                                renderCount={(count) => {
                                    if (count <= 2) return null;
                                    return (
                                        <p className="text-tiny text-default-400 font-medium ms-2">
                                            +{count >= 3 ? count - 3 : count} others
                                        </p>
                                    );
                                }}
                            >
                                {notification?.senders?.map((sender) => (
                                    <Avatar
                                        key={sender?._id}
                                        src={sender?.photo}
                                        alt={sender?.username}
                                        classNames={{ base: "!w-5 !h-5" }}
                                    />
                                ))}
                            </AvatarGroup>
                        )}
                    </div>
                </Link>
                <section>
                    <Button
                        className="group-hover:flex hidden bg-transparent"
                        isIconOnly
                        radius="full"
                        color="danger"
                        variant="light"
                        onPress={onOpen}
                        isLoading={loading}
                    >
                        <TrashIcon size={18} />
                    </Button>
                </section>
            </div>
        </>
    );
}
