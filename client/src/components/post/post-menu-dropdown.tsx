"use client";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, useDisclosure } from "@heroui/react";
import { EyeIcon, LinkIcon, TrashIcon, WandSparkles } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import ConfirmationModal from "../confirmation-modal";

import axiosInstance from "@/utils/http-request";
import { IPost } from "@/types/post";
import { useCopyToClipboard, useGlobalMutation, useIsOwner } from "@/hooks";
import { useTranslation } from "react-i18next";
import { TranslationNameSpace } from "@/types/translation";

interface IProps {
    children: React.ReactNode | React.JSX.Element | React.ReactElement;
    post: IPost;
    onOpenEditModal?: () => void;
}

type PostMenuItem = {
    key: string;
    content: string | React.ReactNode;
    icon: React.ReactNode;
    color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
    className?: string;
    href?: string;
    onClick?: () => void;
};

export default function PostMenuDropdown({ children, post, onOpenEditModal }: IProps) {
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const mutate = useGlobalMutation();
    const isOwner = useIsOwner(post?.postBy?._id);
    const copy = useCopyToClipboard();
    const { t: tPost } = useTranslation<TranslationNameSpace>("post");

    const handleDeletePost = async () => {
        try {
            if (!post) return;

            await axiosInstance.delete(`/post/${post._id}`);

            mutate((key) => typeof key === "string" && key.includes("/post"));

            toast.success(tPost("POST_DELETED_SUCCESS"), {
                position: "bottom-center",
            });
        } catch (error: any) {
            toast.error("Delete post error");
            toast.error(error.response.data.message);
        }
    };

    const items: PostMenuItem[] = [
        {
            key: "copy",
            content: tPost("POST_MENU.COPY_LINK"),
            icon: <LinkIcon size={18} />,
            onClick: () => copy(`${window.location.origin}/post/${post._id}`),
        },
        {
            key: "detail",
            content: tPost("POST_MENU.VIEW_POST"),
            icon: <EyeIcon size={18} />,
            href: `/post/${post._id}`,
        },
    ];

    const ownerItems: PostMenuItem[] = [
        {
            key: "edit",
            content: tPost("POST_MENU.EDIT"),
            icon: <WandSparkles size={18} />,
            onClick: () => onOpenEditModal && onOpenEditModal(),
        },
        ...items,
        {
            key: "delete",
            content: tPost("POST_MENU.DELETE"),
            icon: <TrashIcon size={18} />,
            color: "danger",
            className: "text-danger",
            onClick: () => onOpen(),
        },
    ];

    return (
        <>
            <ConfirmationModal isOpen={isOpen} onOpenChange={onOpenChange} onOk={handleDeletePost} onClose={onClose} />
            <Dropdown placement="bottom-end">
                <DropdownTrigger>{children}</DropdownTrigger>
                <DropdownMenu variant="flat" aria-label="Static Actions">
                    {isOwner // Check if the post is created by the current user or not
                        ? ownerItems.map((item) => (
                              <DropdownItem
                                  as={item?.href ? Link : undefined}
                                  href={item?.href}
                                  onPress={item?.onClick}
                                  className={item.className ?? ""}
                                  color={item.color}
                                  key={item.key}
                                  endContent={item.icon}
                              >
                                  {item.content}
                              </DropdownItem>
                          ))
                        : items.map((item) => (
                              <DropdownItem
                                  as={item?.href ? Link : undefined}
                                  href={item?.href}
                                  onPress={item?.onClick}
                                  className={item.className ?? ""}
                                  color={item.color}
                                  key={item.key}
                                  endContent={item.icon}
                              >
                                  {item.content}
                              </DropdownItem>
                          ))}
                </DropdownMenu>
            </Dropdown>
        </>
    );
}
