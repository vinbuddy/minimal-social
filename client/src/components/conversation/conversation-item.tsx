import { usePathname } from "next/navigation";
import Link from "next/link";
import { Avatar, Badge } from "@heroui/react";
import { ReactNode, useMemo } from "react";

import { useAuthStore } from "@/hooks/store";
import { IConversation } from "@/types/conversation";
import TimeAgo from "../time-ago";
import UserName from "../user/user-name";
import { useConversationContext } from "@/contexts/conversation-context";
import { useBreakpoint } from "@/hooks";

interface IProps {
    conversation: IConversation;
}

export default function ConversationItem({ conversation }: IProps): ReactNode {
    const { currentUser } = useAuthStore();
    const pathname = usePathname();
    const { conversationItem } = useConversationContext();
    const breakpoint = useBreakpoint();

    const isActive = useMemo(() => {
        const isDesktopActive = breakpoint !== "mobile" && pathname.includes(conversation._id);
        const isMobileActive = breakpoint === "mobile" && pathname.includes(conversation._id) && conversationItem;
        return isDesktopActive || isMobileActive;
    }, [breakpoint, pathname, conversation._id, conversationItem]);

    const otherUser = useMemo(() => {
        return currentUser && conversation.participants.find((p) => p._id !== currentUser._id);
    }, [currentUser, conversation.participants]);

    return (
        <Link
            href={`/conversation/${conversation._id}`}
            className={`group relative flex items-center justify-between p-3 rounded-xl hover:bg-content2 transition cursor-pointer ${
                isActive && "bg-content2"
            }`}
        >
            <div className="flex items-center w-full">
                <Badge
                    showOutline={false}
                    color="danger"
                    content={conversation?.unreadCount ?? 0}
                    placement="top-right"
                    shape="circle"
                    isInvisible={!conversation?.unreadCount}
                >
                    <Avatar size="lg" radius="full" src={otherUser?.photo} />
                </Badge>
                <div className="ms-3 flex-1 overflow-hidden">
                    <h3>
                        <UserName isLink={false} className="font-semibold hover:no-underline" user={otherUser} />
                    </h3>
                    <div className="text-default-600 flex items-center justify-between">
                        <p className="flex-1 text-sm max-w-full truncate">
                            {conversation?.lastMessage?.sender === currentUser?._id && "You: "}
                            {conversation?.lastMessage?.content ?? ""}
                        </p>
                        <div className="me-2 text-tiny text-default-400">
                            {conversation?.lastMessage?.createdAt && (
                                <TimeAgo className="!text-tiny" date={conversation?.lastMessage?.createdAt} />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* <Button
                className="absolute top-1 right-2 group-hover:flex hidden bg-transparent"
                isIconOnly
                radius="full"
                variant="light"
                onClick={handleMenuButtonClick}
            >
                <EllipsisIcon className="!text-default-500" size={18} />
            </Button> */}
        </Link>
    );
}
