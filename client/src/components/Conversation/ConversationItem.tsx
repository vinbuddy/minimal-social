import useAuthStore from "@/hooks/store/useAuthStore";
import { IConversation } from "@/types/conversation";
import { Avatar, AvatarGroup, Badge, Button } from "@nextui-org/react";
import { EllipsisIcon } from "lucide-react";
import { ReactNode } from "react";
import TimeAgo from "../TimeAgo";
import UserName from "../User/UserName";

interface IProps {
    isActive?: boolean;
    conversation: IConversation;
}

export default function ConversationItem({ isActive = false, conversation }: IProps): ReactNode {
    // remove me from participants

    const { currentUser } = useAuthStore();

    const otherUser =
        currentUser && conversation.participants.find((participant) => participant._id !== currentUser._id);

    return (
        <div
            className={`group relative flex items-center justify-between p-3 rounded-xl hover:bg-content2 transition cursor-pointer ${
                isActive && "bg-content2"
            }`}
        >
            <div className="flex items-center w-full">
                <Avatar size="lg" radius="full" src={otherUser?.photo} />
                <div className="ms-3 flex-1 overflow-hidden">
                    <h3>
                        <UserName isLink={false} className="font-semibold hover:no-underline" user={otherUser} />
                    </h3>
                    <div className="text-default-600 flex items-center justify-between">
                        <p className="flex-1 text-sm max-w-full truncate">{conversation.lastMessage?.content ?? ""}</p>
                        <p className="me-2 text-tiny text-default-400">
                            {conversation?.lastMessage?.createdAt && (
                                <TimeAgo className="!text-sm" date={conversation?.lastMessage?.createdAt} />
                            )}
                        </p>
                    </div>
                    {/* <div className="flex items-center  mt-1">
                        <AvatarGroup
                            max={3}
                            total={4}
                            renderCount={(count) => {
                                if (count <= 2) return null;
                                return <p className="text-tiny text-default-400 font-medium ms-1"></p>;
                            }}
                        >
                            <Avatar
                                src="https://res.cloudinary.com/dtbhvc4p4/image/upload/v1722315011/avatar/mh7gflqx767v1vg4tn4q.png"
                                classNames={{ base: "!w-4 !h-4" }}
                            />
                            <Avatar
                                src="https://res.cloudinary.com/dtbhvc4p4/image/upload/v1720978549/profile/344060599-e8733bc3-ac77-42c6-b036-b9f1fb31b21c_hlh6by.png"
                                classNames={{ base: "!w-4 !h-4" }}
                            />
                        </AvatarGroup>
                    </div> */}
                </div>
            </div>

            <Button
                className="absolute top-1 right-2 group-hover:flex hidden bg-transparent"
                isIconOnly
                radius="full"
                variant="light"
            >
                <EllipsisIcon className="!text-default-500" size={18} />
            </Button>
        </div>
    );
}
