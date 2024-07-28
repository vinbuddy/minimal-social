import { Avatar, Badge, Tooltip } from "@nextui-org/react";
import UserName from "./UserName";
import FollowButton from "./FollowButton";
import { HeartIcon, RepostIcon } from "@/assets/icons";
import { IUser } from "@/types/user";
import UserProfileCard from "./UserProfileCard";
import Link from "next/link";

interface IProps {
    user: IUser;
    href?: string;
}

export default function UserItem({ user, href }: IProps) {
    return (
        <Link
            href={href ?? "#"}
            className="flex items-center justify-between py-5 border-b border-divider last:border-none ps-1"
        >
            <section className="flex items-center gap-4">
                <Badge
                    isOneChar
                    size="md"
                    content={<HeartIcon isFilled size={12} />}
                    color="danger"
                    placement="bottom-right"
                >
                    <Avatar size="sm" isBordered src={user?.photo} />
                </Badge>
                <Tooltip delay={500} placement="bottom-start" content={<UserProfileCard user={user} />}>
                    <h4>
                        <UserName user={user} />
                    </h4>
                </Tooltip>
            </section>
            <section>
                <FollowButton
                    user={user}
                    onAfterFollowed={() => {}}
                    onAfterUnFollowed={() => {}}
                    buttonProps={{ size: "sm", radius: "md", fullWidth: false }}
                />
            </section>
        </Link>
    );
}
