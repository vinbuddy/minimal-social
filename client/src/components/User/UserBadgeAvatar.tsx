import { Avatar, Badge } from "@nextui-org/react";
import { AtSignIcon, MessageCircleIcon, UserIcon } from "lucide-react";
import { HeartIcon, RepostIcon } from "@/assets/icons";
import { IUserBadgeTheme } from "@/types/user";

interface IProps {
    action: string;
    photo: string;
}

export const NOTIFICATION_THEME_BY_ACTION: IUserBadgeTheme = {
    like: {
        icon: <HeartIcon isFilled size={14} />,
        color: "danger",
    },
    comment: {
        icon: <MessageCircleIcon stroke="none" fill="#fff" size={14} />,
        color: "success",
    },
    follow: {
        icon: <UserIcon stroke="none" fill="currentColor" size={14} />,
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

export default function UserBadgeAvatar({ action, photo }: IProps) {
    return (
        <div>
            <Badge
                isOneChar
                size="lg"
                color={NOTIFICATION_THEME_BY_ACTION[action]?.color ?? "primary"}
                content={NOTIFICATION_THEME_BY_ACTION[action]?.icon ?? ""}
                placement="bottom-right"
                className="z-[1]"
            >
                <Avatar isBordered src={photo} />
            </Badge>
        </div>
    );
}
