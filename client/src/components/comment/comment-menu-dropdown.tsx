import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, useDisclosure } from "@nextui-org/react";
import { CopyIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";

import { IComment } from "@/types/comment";
import { showToast } from "@/utils/toast";
import ConfirmationModal from "../confirmation-modal";
import axiosInstance from "@/utils/httpRequest";
import { useAuthStore } from "@/hooks/store";
import { useGlobalMutation } from "@/hooks";

interface IProps {
    children: React.ReactNode | React.JSX.Element | React.ReactElement;
    comment: IComment;
}

type CommentMenuItem = {
    key: string;
    content: string | React.ReactNode;
    icon: React.ReactNode;
    color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
    className?: string;
    href?: string;
    onClick?: () => void;
};

export default function CommentMenuDropdown({ children, comment }: IProps) {
    const { currentUser } = useAuthStore();

    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const mutate = useGlobalMutation();

    const handleCopy = async (): Promise<void> => {
        try {
            await navigator.clipboard.writeText(comment.content);
            showToast("Copied comment", "success");
        } catch (err) {
            showToast("Copy comment failed", "error");
        }
    };

    const handleDeleteComment = async () => {
        if (!comment) return;

        try {
            const response = await axiosInstance.delete(`/comment/${comment._id}`);

            mutate((key) => typeof key === "string" && key.includes("/comment"));
            mutate((key) => typeof key === "string" && key.includes("/post"));

            showToast("Delete comment successfully", "success");
        } catch (error: any) {
            showToast(error.response.data.message, "error");
        }
    };

    const items: CommentMenuItem[] = [
        {
            key: "copy",
            content: "Copy content",
            icon: <CopyIcon size={16} />,
            onClick: handleCopy,
        },
    ];

    const ownerItems: CommentMenuItem[] = [
        {
            key: "delete",
            content: "Delete comment",
            icon: <TrashIcon size={16} />,
            color: "danger",
            className: "text-danger",
            onClick: () => onOpen(),
        },
        ...items,
    ];

    const commentMenuItems = currentUser?._id === comment?.commentBy._id ? ownerItems : items;

    return (
        <>
            <ConfirmationModal
                title="Are you sure you want to delete this comment ?"
                description=""
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                onOk={handleDeleteComment}
            />
            <Dropdown>
                <DropdownTrigger>{children}</DropdownTrigger>
                <DropdownMenu>
                    {commentMenuItems.map((item) => (
                        <DropdownItem
                            key={item.key}
                            color={item.color}
                            className={item.className}
                            endContent={item.icon}
                            onPress={item.onClick}
                        >
                            {item.content}
                        </DropdownItem>
                    ))}
                </DropdownMenu>
            </Dropdown>
        </>
    );
}
