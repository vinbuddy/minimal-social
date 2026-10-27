"use client";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, useDisclosure } from "@heroui/react";
import { AudioLinesIcon, LinkIcon, Trash2Icon, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import ConfirmationModal from "../confirmation-modal";
import { useCopyToClipboard, useIsOwner } from "@/hooks";
import { useAuthStore } from "@/hooks/store";
import { IReel } from "@/types/reel";
import axiosInstance from "@/utils/http-request";
import { showToast } from "@/utils/toast";

interface IProps {
    reel: IReel;
    children: React.ReactNode;
    onDeleted?: (reel: IReel) => void;
}

export default function ReelMenuDropdown({ reel, children, onDeleted }: IProps) {
    const router = useRouter();
    const copy = useCopyToClipboard();
    const isOwner = useIsOwner(reel?.reelBy?._id);
    const { currentUser } = useAuthStore();
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const { t: tReel } = useTranslation("reel");
    const { t } = useTranslation("common");

    const canDelete = isOwner || currentUser?.isAdmin;

    const handleDelete = async () => {
        try {
            await axiosInstance.delete(`/reel/${reel._id}`);

            onDeleted && onDeleted(reel);
            showToast(tReel("REEL_DELETED_SUCCESS"), "success");
        } catch (error: any) {
            showToast(error?.response?.data?.message ?? "Failed to delete reel", "error");
        }
    };

    const items = [
        {
            key: "copy-link",
            label: tReel("REEL_MENU.COPY_LINK"),
            icon: <LinkIcon size={16} />,
            onPress: () => copy(`${window.location.origin}/reels/${reel._id}`),
        },
        ...(reel.audio
            ? [
                  {
                      key: "audio",
                      label: tReel("REEL_MENU.GO_TO_AUDIO"),
                      icon: <AudioLinesIcon size={16} />,
                      onPress: () => router.push(`/reels/audio/${reel.audio?._id}`),
                  },
              ]
            : []),
        {
            key: "profile",
            label: tReel("REEL_MENU.VIEW_PROFILE"),
            icon: <UserIcon size={16} />,
            onPress: () => router.push(`/profile/${reel.reelBy._id}`),
        },
        ...(canDelete
            ? [
                  {
                      key: "delete",
                      label: tReel("REEL_MENU.DELETE"),
                      icon: <Trash2Icon size={16} />,
                      onPress: onOpen,
                  },
              ]
            : []),
    ];

    return (
        <>
            <Dropdown placement="left-end">
                <DropdownTrigger>{children}</DropdownTrigger>
                <DropdownMenu aria-label={tReel("REEL_MORE_OPTIONS")} variant="flat" items={items}>
                    {(item) => (
                        <DropdownItem
                            key={item.key}
                            textValue={item.label}
                            startContent={item.icon}
                            onPress={item.onPress}
                            color={item.key === "delete" ? "danger" : "default"}
                            className={item.key === "delete" ? "text-danger" : ""}
                        >
                            {item.label}
                        </DropdownItem>
                    )}
                </DropdownMenu>
            </Dropdown>

            <ConfirmationModal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                onClose={onClose}
                onOk={handleDelete}
                title={tReel("REEL_MENU.DELETE_CONFIRM_TITLE")}
                description={tReel("REEL_MENU.DELETE_CONFIRM")}
                okButtonContent={t("DELETE")}
            />
        </>
    );
}
