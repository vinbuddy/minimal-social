import { Avatar, Badge } from "@nextui-org/react";
import { ReactNode } from "react";

interface IProps {
    isActive?: boolean;
}

export default function ChatItem({ isActive = false }: IProps): ReactNode {
    return (
        <div
            className={`flex items-center p-3 rounded-xl hover:bg-default transition cursor-pointer ${
                isActive && "bg-default"
            }`}
        >
            {/* <Badge content="" color="default" shape="circle" placement="bottom-right">
                <Avatar radius="full" src="https://i.pravatar.cc/150?u=a04258a2462d826712d" />
            </Badge> */}
            <Avatar radius="full" src="https://i.pravatar.cc/150?u=a04258a2462d826712d" />
            <div className="ms-3">
                <h3 className="font-semibold">Min</h3>
                <p className="text-sm text-default-500">Online 4 minutes ago</p>
            </div>
        </div>
    );
}
