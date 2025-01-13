import { Avatar, AvatarProps, Tooltip } from "@nextui-org/react";
import UserName from "./user-name";
import FollowButton from "./follow-button";
import { IUser } from "@/types/user";
import UserProfileCard from "./user-profile-card";
import Link from "next/link";

interface IProps {
    user: IUser;
    href?: string;
    isShowedFollowButton?: boolean;
    avatarProps?: AvatarProps;
}

export default function UserItem({ user, href, isShowedFollowButton = true, avatarProps = {} }: IProps) {
    const Wrapper = href ? Link : "div";

    return (
        <Wrapper
            href={href ?? "#"}
            className="flex items-center justify-between py-3 border-b border-divider last:border-none ps-1"
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
                        buttonProps={{ size: "sm", radius: "md", fullWidth: false }}
                    />
                </section>
            )}
        </Wrapper>
    );
}
