"use client";
import useAuthStore from "@/hooks/store/useAuthStore";
import { IPost } from "@/types/post";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, useDisclosure } from "@nextui-org/react";
import { EyeIcon, LinkIcon, TrashIcon, WandSparkles } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { toast } from "sonner";
import ConfirmationModal from "../ConfirmationModal";
import axiosInstance from "@/utils/httpRequest";
import useGlobalMutation from "@/hooks/useGlobalMutation";

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
    const { currentUser } = useAuthStore();
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const mutate = useGlobalMutation();

    const handleCopyLink = async (): Promise<void> => {
        try {
            const pathName = `/post/${post._id}`;
            await navigator.clipboard.writeText(window.location.origin + pathName);
            toast.success("Copied link", { position: "bottom-center" });
        } catch (err) {
            toast.error("Copied error");
        }
    };

    const handleDeletePost = async () => {
        try {
            if (!post) return;
            const response = await axiosInstance.delete(`/post/${post._id}`);

            mutate((key) => typeof key === "string" && key.includes("/post"));
            toast.success("Delete post successfully", {
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
            content: "Copy link",
            icon: <LinkIcon size={18} />,
            onClick: handleCopyLink,
        },
        {
            key: "detail",
            content: "View post",
            icon: <EyeIcon size={18} />,
            href: `/post/${post._id}`,
        },
    ];

    const ownerItems: PostMenuItem[] = [
        {
            key: "edit",
            content: "Edit post",
            icon: <WandSparkles size={18} />,
            onClick: () => onOpenEditModal && onOpenEditModal(),
        },
        ...items,
        {
            key: "delete",
            content: "Delete post",
            icon: <TrashIcon size={18} />,
            color: "danger",
            className: "text-danger",
            onClick: () => onOpen(),
        },
    ];

    return (
        <>
            <ConfirmationModal isOpen={isOpen} onOpenChange={onOpenChange} onOk={handleDeletePost} />
            <Dropdown placement="bottom-end">
                <DropdownTrigger>{children}</DropdownTrigger>
                <DropdownMenu variant="flat" aria-label="Static Actions">
                    {post?.postBy?._id === currentUser?._id // Check if the post is created by the current user or not
                        ? ownerItems.map((item) => (
                              <DropdownItem
                                  as={item?.href ? Link : undefined}
                                  href={item?.href}
                                  onClick={item?.onClick}
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
                                  onClick={item?.onClick}
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
