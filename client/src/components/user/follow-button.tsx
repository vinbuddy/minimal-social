"use client";

import { Button, ButtonProps } from "@nextui-org/react";
import { useState } from "react";
import { toast } from "sonner";

import { useAuthStore } from "@/hooks/store";
import { IUser } from "@/types/user";
import axiosInstance from "@/utils/http-request";

interface IProps extends ButtonProps {
    user: IUser;
    onAfterFollowed?: () => void;
    onAfterUnFollowed?: () => void;
}

export default function FollowButton({ user, onAfterFollowed, onAfterUnFollowed, ...rest }: IProps) {
    const { currentUser } = useAuthStore();

    const [isFollowed, setIsFollowed] = useState<boolean>(() => {
        if (!currentUser) return false;

        return user?.followers?.includes(currentUser._id) ?? false;
    });

    const handleFollow = async () => {
        try {
            if (!currentUser) return;
            setIsFollowed(true);

            const response = await axiosInstance.put("/user/follow", {
                userId: user._id,
                currentUserId: currentUser._id,
            });

            await axiosInstance.post("/notification", {
                target: user?._id,
                targetType: "User",
                action: "follow",
                photo: currentUser?.photo,
                message: `followed you`,
                sender: currentUser?._id,
                receivers: [user?._id],
                url: `/profile/${currentUser?._id}`,
            });

            onAfterFollowed && onAfterFollowed();

            toast.success("Followed successfully", { position: "bottom-center" });
        } catch (error: any) {
            setIsFollowed(false);
            toast.error("Failed to follow user", { position: "bottom-center" });
            toast.error(error.response.data.message, { position: "bottom-center" });
        }
    };

    const handleUnFollow = async () => {
        try {
            if (!currentUser) return;
            setIsFollowed(false);

            const response = await axiosInstance.put("/user/unfollow", {
                userId: user._id,
                currentUserId: currentUser._id,
            });

            onAfterUnFollowed && onAfterUnFollowed();

            toast.success("Unfollowed successfully", { position: "bottom-center" });
        } catch (error: any) {
            setIsFollowed(true);

            toast.error("Failed to unfollow", { position: "bottom-center" });
            toast.error(error.response.data.message, { position: "bottom-center" });
        }
    };

    return (
        <Button
            onPress={isFollowed ? handleUnFollow : handleFollow}
            color={isFollowed ? "default" : "primary"}
            variant={isFollowed ? "ghost" : "solid"}
            className={`${currentUser && currentUser._id === user._id ? "hidden" : ""}`}
            {...rest}
        >
            {isFollowed ? "Unfollow" : "Follow"}
        </Button>
    );
}
