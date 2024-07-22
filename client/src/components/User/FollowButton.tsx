"use client";

import useAuthStore from "@/hooks/store/useAuthStore";
import { IUser } from "@/types/user";
import axiosInstance from "@/utils/httpRequest";
import { Button, ButtonProps } from "@nextui-org/react";
import { useState } from "react";
import { set } from "react-hook-form";
import { toast } from "sonner";

interface IProps {
    user: IUser;
    buttonProps: ButtonProps;
    onAfterFollowed?: () => void;
    onAfterUnFollowed?: () => void;
}

export default function FollowButton({ user, buttonProps, onAfterFollowed, onAfterUnFollowed }: IProps) {
    const { currentUser } = useAuthStore();

    const [isFollowed, setIsFollowed] = useState<boolean>(() => {
        if (!currentUser) return false;

        return user?.followers?.includes(currentUser._id) ?? false;
    });

    const handleFollow = async () => {
        try {
            if (!currentUser) return;

            const response = await axiosInstance.put("/user/follow", {
                userId: user._id,
                currentUserId: currentUser._id,
            });

            onAfterFollowed && onAfterFollowed();

            toast.success("Followed successfully", { position: "bottom-center" });
            setIsFollowed(true);
        } catch (error: any) {
            setIsFollowed(false);
            toast.error("Failed to follow user", { position: "bottom-center" });
            toast.error(error.response.data.message, { position: "bottom-center" });
        }
    };

    const handleUnFollow = async () => {
        try {
            if (!currentUser) return;

            const response = await axiosInstance.put("/user/unfollow", {
                userId: user._id,
                currentUserId: currentUser._id,
            });

            onAfterUnFollowed && onAfterUnFollowed();

            toast.success("Unfollowed successfully", { position: "bottom-center" });

            setIsFollowed(false);
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
            {...buttonProps}
        >
            {isFollowed ? "Unfollow" : "Follow"}
        </Button>
    );
}
