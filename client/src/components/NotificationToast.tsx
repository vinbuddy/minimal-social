import { HeartIcon, RepostIcon } from "@/assets/icons";
import { INotification, INotificationTheme } from "@/types/notification";
import { IUser } from "@/types/user";
import { Avatar, Badge } from "@nextui-org/react";
import { AtSignIcon, MessageCircleIcon, UserIcon } from "lucide-react";
import Link from "next/link";

interface IProps {
    notification: INotification;
    sender: IUser;
}

const NOTIFICATION_THEME_BY_ACTION: INotificationTheme = {
    like: {
        icon: <HeartIcon isFilled size={14} />,
        color: "danger",
    },
    comment: {
        icon: <MessageCircleIcon stroke="none" fill="#fff" size={14} />,
        color: "success",
    },
    follow: {
        icon: <UserIcon stroke="none" fill="#fff" size={14} />,
        color: "primary",
    },
    repost: {
        icon: <RepostIcon size={14} />,
        color: "primary",
    },
    mention: {
        icon: <AtSignIcon size={14} />,
        color: "primary",
    },
};

export default function NotificationToast({ notification, sender }: IProps) {
    return (
        <Link href={notification?.url ?? "#"} className="flex items-center">
            <section>
                <Badge
                    isOneChar
                    size="lg"
                    color={NOTIFICATION_THEME_BY_ACTION[notification?.action]?.color ?? "primary"}
                    content={NOTIFICATION_THEME_BY_ACTION[notification?.action]?.icon ?? ""}
                    placement="bottom-right"
                >
                    <Avatar isBordered src={notification?.photo} />
                </Badge>
            </section>
            <section className="ms-4">
                <h4 className="font-semibold">
                    <span className="text-blue-500">{sender?.username}</span> {notification?.message}
                </h4>
            </section>
        </Link>
    );
}
