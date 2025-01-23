import { Avatar, AvatarProps, Tooltip } from "@heroui/react";
import Link from "next/link";
import cn from "classnames";

import UserName from "./user-name";
import FollowButton from "./follow-button";
import { IUser } from "@/types/user";
import UserProfileCard from "./user-profile-card";

interface IProps extends React.HTMLAttributes<HTMLDivElement | HTMLAnchorElement> {
    user: IUser;
    href?: string;
    isShowedFollowButton?: boolean;
    avatarProps?: AvatarProps;
}

export default function UserItem({ user, href, isShowedFollowButton = true, className, avatarProps = {} }: IProps) {
    const Wrapper = href ? Link : "div";

    return (
        <Wrapper
            href={href ?? "#"}
            className={cn(
                "flex items-center justify-between py-3 border-b border-divider last:border-none ps-1",
                className
            )}
        >
            <section className="flex items-center gap-4">
                <Avatar size="sm" isBordered src={user?.photo} {...avatarProps} />

                <Tooltip delay={500} placement="bottom-start" content={<UserProfileCard user={user} />}>
                    <h4>
                        <UserName user={user} />
                    </h4>
                </Tooltip>
            </section>
            {isShowedFollowButton && (
                <section>
                    <FollowButton
                        user={user}
                        onAfterFollowed={() => {}}
                        onAfterUnFollowed={() => {}}
                        size="sm"
                        radius="md"
                        fullWidth={false}
                    />
                </section>
            )}
        </Wrapper>
    );
}
