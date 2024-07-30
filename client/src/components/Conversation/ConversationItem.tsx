import { Avatar, AvatarGroup, Badge, Button } from "@nextui-org/react";
import { DotIcon, EllipsisIcon } from "lucide-react";
import { ReactNode } from "react";

interface IProps {
    isActive?: boolean;
}

export default function ConversationItem({ isActive = false }: IProps): ReactNode {
    return (
        <div
            className={`group relative flex items-center justify-between p-3 rounded-xl hover:bg-default transition cursor-pointer ${
                isActive && "bg-default"
            }`}
        >
            <div className="flex items-center w-full">
                <Avatar size="lg" radius="full" src="https://i.pravatar.cc/150?u=a04258a2462d826712d" />
                <div className="ms-3 flex-1 overflow-hidden">
                    <h3 className="font-semibold">Min</h3>
                    <div className="text-default-600 flex items-center justify-between">
                        <p className="flex-1 text-sm max-w-full truncate">Hey, whats up bro </p>
                        <p className="me-2 text-tiny text-default-400">10 weeks</p>
                    </div>
                    <div className="flex items-center  mt-1">
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
                    </div>
                </div>
            </div>

            <Button
                className="absolute top-0 right-2 group-hover:flex hidden bg-transparent"
                isIconOnly
                radius="full"
                variant="light"
            >
                <EllipsisIcon className="!text-default-500" size={18} />
            </Button>
        </div>
    );
}
