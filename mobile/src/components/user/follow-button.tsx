import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleProp, ViewStyle } from "react-native";

import { Button, ButtonProps, toast } from "@/components/ui";
import { invalidate } from "@/lib/invalidate";
import { getErrorMessage } from "@/services/auth";
import { notify } from "@/services/notifications";
import { followUser, unfollowUser, userUrl } from "@/services/users";
import useAuthStore from "@/stores/auth-store";
import { useFollowStore, useIsFollowing } from "@/stores/follow-store";
import { IUser } from "@/types/user";

type FollowButtonProps = {
    user: IUser;
    size?: ButtonProps["size"];
    fullWidth?: boolean;
    style?: StyleProp<ViewStyle>;
    /** +1 on follow, -1 on unfollow, for a follower count shown beside it */
    onChange?: (delta: 1 | -1) => void;
};

/** Solid Follow, bordered Unfollow, as on the web; hidden on your own profile */
export function FollowButton({ user, size = "md", fullWidth = false, style, onChange }: FollowButtonProps) {
    const { t } = useTranslation("user");
    const currentUser = useAuthStore((state) => state.currentUser);
    const setFollowing = useFollowStore((state) => state.setFollowing);
    const isFollowing = useIsFollowing(user._id, user.isFollowing);
    const [isBusy, setIsBusy] = useState(false);

    if (!currentUser || currentUser._id === user._id) return null;

    const toggle = async () => {
        const next = !isFollowing;
        setFollowing(user._id, next);
        onChange?.(next ? 1 : -1);
        setIsBusy(true);

        try {
            if (next) {
                await followUser(user._id);
                notify(currentUser, {
                    target: user._id,
                    targetType: "User",
                    action: "follow",
                    message: "followed you",
                    receivers: [user._id],
                    url: `/profile/${currentUser._id}`,
                });
            } else {
                await unfollowUser(user._id);
            }
            // Counts on both profiles and the Following feed change
            invalidate(userUrl(user._id));
            invalidate(userUrl(currentUser._id));
            invalidate("/post/following");
        } catch (error) {
            setFollowing(user._id, !next);
            onChange?.(next ? -1 : 1);
            toast.error(getErrorMessage(error));
        } finally {
            setIsBusy(false);
        }
    };

    return (
        <Button
            size={size}
            fullWidth={fullWidth}
            variant={isFollowing ? "bordered" : "solid"}
            color={isFollowing ? "default" : "primary"}
            isDisabled={isBusy}
            onPress={toggle}
            style={style}
        >
            {t(isFollowing ? "USER.UNFOLLOW" : "USER.FOLLOW")}
        </Button>
    );
}
