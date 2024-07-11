import useAuthStore from "@/hooks/store/useAuthStore";
import { IPost } from "@/types/post";
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    BaseColors,
    ThemeColors,
    SemanticBaseColors,
    useDisclosure,
    Tooltip,
} from "@nextui-org/react";
import { EyeIcon, LinkIcon, TrashIcon, WandSparkles } from "lucide-react";
import { Fragment } from "react";
import PostModalButton from "./PostModalButton";

interface IProps {
    children: React.ReactNode | React.JSX.Element | React.ReactElement;
    post: IPost;
    onOpenEditModal?: () => void;
}

type PostMenuItem = {
    key: string;
    content: string;
    icon: React.ReactNode;
    color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
    className?: string;
    onClick?: () => void;
};

export default function PostMenuDropdown({ children, post, onOpenEditModal }: IProps) {
    const { currentUser } = useAuthStore();
    const items: PostMenuItem[] = [
        {
            key: "copy",
            content: "Copy link",
            icon: <LinkIcon size={18} />,
        },
        {
            key: "detail",
            content: "View detail",
            icon: <EyeIcon size={18} />,
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
        },
    ];

    return (
        <>
            <Dropdown placement="bottom-end">
                <DropdownTrigger>{children}</DropdownTrigger>
                <DropdownMenu variant="flat" aria-label="Static Actions">
                    {post?.postBy?._id === currentUser?._id // Check if the post is created by the current user or not
                        ? ownerItems.map((item) => (
                              <DropdownItem
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
                              <Fragment key={item.key}>
                                  <DropdownItem
                                      onClick={item?.onClick}
                                      className={item.className ?? ""}
                                      color={item.color}
                                      key={item.key}
                                      endContent={item.icon}
                                  >
                                      {item.content}
                                  </DropdownItem>
                              </Fragment>
                          ))}

                    {/* <DropdownItem key="new">New file</DropdownItem>
                        <DropdownItem key="copy">Copy link</DropdownItem>
                        <DropdownItem key="edit">Edit file</DropdownItem>
                        <DropdownItem key="delete" className="text-danger" color="danger">
                            Delete file
                        </DropdownItem> */}
                </DropdownMenu>
            </Dropdown>
        </>
    );
}
