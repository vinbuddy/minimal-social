import { Avatar, Badge, Button } from "@nextui-org/react";
import { EllipsisIcon } from "lucide-react";
import { ReactNode } from "react";

interface IProps {
    isActive?: boolean;
}

export default function ConversationItem({ isActive = false }: IProps): ReactNode {
    return (
        <div
            className={`group flex items-center justify-between p-3 rounded-xl hover:bg-default transition cursor-pointer ${
                isActive && "bg-default"
            }`}
        >
            {/* <Badge content="" color="default" shape="circle" placement="bottom-right">
                <Avatar radius="full" src="https://i.pravatar.cc/150?u=a04258a2462d826712d" />
            </Badge> */}
            <div className="flex items-center">
                <Avatar radius="full" src="https://i.pravatar.cc/150?u=a04258a2462d826712d" />
                <div className="ms-3">
                    <h3 className="font-semibold">Min</h3>
                    <p className="text-sm text-default-500">Online 4 minutes ago</p>
                </div>
            </div>

            <Button className="group-hover:flex hidden bg-transparent" isIconOnly radius="full" variant="light">
                <EllipsisIcon className="!text-default-500" size={18} />
            </Button>
        </div>
    );
}
