import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, useDisclosure } from "@heroui/react";
import { CopyIcon, TrashIcon } from "lucide-react";
import { IComment } from "@/types/comment";
import { showToast } from "@/utils/toast";
import ConfirmationModal from "../confirmation-modal";
import axiosInstance from "@/utils/http-request";
import { useCopyToClipboard, useGlobalMutation, useIsOwner } from "@/hooks";
import { useTranslation } from "react-i18next";

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
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const mutate = useGlobalMutation();
    const isOwner = useIsOwner(comment?.commentBy?._id);
    const copy = useCopyToClipboard();

    const { t: tComment } = useTranslation("comment");

    const handleDeleteComment = async () => {
        if (!comment) return;

        try {
            await axiosInstance.delete(`/comment/${comment._id}`);

            mutate((key) => typeof key === "string" && key.includes("/comment"));
            mutate((key) => typeof key === "string" && key.includes("/post"));

            showToast(tComment("COMMENT_MESSAGE.DELETE_COMMENT_SUCCESS"), "success");
        } catch (error: any) {
            showToast(error.response.data.message, "error");
        }
    };

    const items: CommentMenuItem[] = [
        {
            key: "copy",
            content: tComment("COMMENT_MENU.COPY_COMMENT"),
            icon: <CopyIcon size={16} />,
            onClick: () => copy(comment.content),
        },
    ];

    const ownerItems: CommentMenuItem[] = [
        {
            key: "delete",
            content: tComment("COMMENT_MENU.DELETE_COMMENT"),
            icon: <TrashIcon size={16} />,
            color: "danger",
            className: "text-danger",
            onClick: () => onOpen(),
        },
        ...items,
    ];

    const commentMenuItems = isOwner ? ownerItems : items;

    return (
        <>
            <ConfirmationModal
                title={tComment("COMMENT_MENU.DELETE_COMMENT_CONFIRM")}
                description=""
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                onOk={handleDeleteComment}
                onClose={onClose}
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
