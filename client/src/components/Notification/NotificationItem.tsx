import { INotification } from "@/types/notification";
import NotificationThumbnail from "./NotificationThumbnail";
import Link from "next/link";
import { Avatar, AvatarGroup, Button } from "@nextui-org/react";
import { EllipsisIcon } from "lucide-react";

interface IProps {
    notification?: INotification;
}

export default function NotificationItem({ notification }: IProps) {
    return (
        <div className="group flex items-center justify-between py-5 border-b border-divider last:border-none ps-1">
            <Link href="" className="flex flex-1 gap-5">
                <NotificationThumbnail photo="https://avatars.githubusercontent.com/u/94288269?v=4" action="like" />
                <div>
                    <h4>
                        <Link href="/profile/vinbuddy" className="font-semibold">
                            vinbuddy
                        </Link>{" "}
                        and 2 others liked your post
                    </h4>
                    <p className="text-default-400 text-sm mt-1 mb-2">4 minutes ago</p>

                    <AvatarGroup
                        max={3}
                        total={10}
                        renderCount={(count) => (
                            <p className="text-tiny text-default-400 font-medium ms-2">+{count} others</p>
                        )}
                    >
                        <Avatar
                            classNames={{ base: "!w-5 !h-5" }}
                            src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
                        />
                        <Avatar
                            classNames={{ base: "!w-5 !h-5" }}
                            src="https://i.pravatar.cc/150?u=a04258a2462d826712d"
                        />
                        <Avatar
                            classNames={{ base: "!w-5 !h-5" }}
                            src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                        />
                        <Avatar
                            classNames={{ base: "!w-5 !h-5" }}
                            src="https://i.pravatar.cc/150?u=a04258114e29026302d"
                        />
                        <Avatar
                            classNames={{ base: "!w-5 !h-5" }}
                            src="https://i.pravatar.cc/150?u=a04258114e29026702d"
                        />
                        <Avatar
                            classNames={{ base: "!w-5 !h-5" }}
                            src="https://i.pravatar.cc/150?u=a04258114e29026708c"
                        />
                    </AvatarGroup>
                </div>
            </Link>
            <section>
                <Button className="group-hover:flex hidden bg-transparent" isIconOnly radius="full" variant="light">
                    <EllipsisIcon className="!text-default-500" size={18} />
                </Button>
            </section>
        </div>
    );
}
