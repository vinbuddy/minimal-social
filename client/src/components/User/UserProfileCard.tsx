import React from "react";
import { Avatar, Card, CardBody, CardFooter, CardHeader } from "@nextui-org/react";
import { IUser } from "@/types/user";
import { VerifiedIcon } from "@/assets/icons";
import FollowButton from "./FollowButton";

interface IProps {
    user: IUser;
}

export default function UserProfileCard({ user }: IProps) {
    const [followerCount, setFollowerCount] = React.useState(user?.followers?.length ?? 0);
    return (
        <Card shadow="none" className="min-w-[300px] max-w-[350px] p-1 border-none bg-transparent">
            <CardHeader className="justify-between">
                <div className="flex gap-3">
                    <Avatar isBordered radius="full" size="md" src={user?.photo} />
                    <div className="flex flex-col items-start justify-center">
                        <h4 className="flex items-center text-base font-semibold leading-none text-default-600">
                            {user?.username}
                            {user?.isVerified && <VerifiedIcon size={14} className="text-verify ms-1.5" />}
                        </h4>
                        {/* <h5 className="text-small tracking-tight text-default-500">{user?.email}</h5> */}
                    </div>
                </div>
            </CardHeader>
            <CardBody className="px-3 py-0">
                <p className="text-small pl-px text-default-500">{user?.bio || "This user has no bio yet."}</p>
                <div className="flex gap-3 mt-3 mb-2">
                    <div className="flex gap-1">
                        <p className="font-semibold text-default-600 text-small">{user?.followings?.length ?? 0}</p>
                        <p className=" text-default-500 text-small">Following</p>
                    </div>
                    <div className="flex gap-1">
                        <p className="font-semibold text-default-600 text-small">{followerCount}</p>
                        <p className="text-default-500 text-small">Followers</p>
                    </div>
                </div>
            </CardBody>
            <CardFooter className="gap-3">
                <FollowButton
                    user={user}
                    onAfterFollowed={() => setFollowerCount((prev) => prev + 1)}
                    onAfterUnFollowed={() => setFollowerCount((prev) => prev - 1)}
                    buttonProps={{ size: "sm", radius: "md", fullWidth: true }}
                />
            </CardFooter>
        </Card>
    );
}
