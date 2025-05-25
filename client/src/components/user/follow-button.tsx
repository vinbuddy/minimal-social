"use client";

import { Button, ButtonProps } from "@heroui/react";
import { useState } from "react";
import { toast } from "sonner";

import { useAuthStore } from "@/hooks/store";
import { IUser } from "@/types/user";
import axiosInstance from "@/utils/http-request";
import { showToast } from "@/utils/toast";
import { useTranslation } from "react-i18next";

interface IProps extends ButtonProps {
    user: IUser;
    onAfterFollowed?: () => void;
    onAfterUnFollowed?: () => void;
}

export default function FollowButton({ user, onAfterFollowed, onAfterUnFollowed, ...rest }: IProps) {
    const { currentUser } = useAuthStore();
    const { t: tUser } = useTranslation("user");

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

            showToast("Followed successfully", "success");
        } catch (error: any) {
            setIsFollowed(false);
            showToast(error?.response?.data?.message ?? "Failed to follow user", "error");
        }
    };

    const handleUnFollow = async () => {
        try {
            if (!currentUser) return;
            setIsFollowed(false);

            await axiosInstance.put("/user/unfollow", {
                userId: user._id,
                currentUserId: currentUser._id,
            });

            onAfterUnFollowed && onAfterUnFollowed();

            showToast("Unfollowed successfully", "success");
        } catch (error: any) {
            setIsFollowed(true);

            showToast(error?.response?.data?.message ?? "Failed to unfollow user", "error");
        }
    };

    return (
        <Button
            type="button"
            onPress={isFollowed ? handleUnFollow : handleFollow}
            color={isFollowed ? "default" : "primary"}
            variant={isFollowed ? "ghost" : "solid"}
            className={`${currentUser && currentUser._id === user._id ? "hidden" : ""}`}
            {...rest}
        >
            {isFollowed ? tUser("USER.UNFOLLOW") : tUser("USER.FOLLOW")}
        </Button>
    );
}
