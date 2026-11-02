import { AtSign, Trash2, UserPlus } from "lucide-react-native";
import { memo, ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { CommentIcon, HeartIcon, RepostIcon } from "@/components/icons";
import { ActionSheet, Avatar, Text, toast } from "@/components/ui";
import { openAppUrl } from "@/lib/app-links";
import { invalidate } from "@/lib/invalidate";
import { formatShortTime } from "@/lib/time";
import { getErrorMessage } from "@/services/auth";
import { deleteNotification } from "@/services/notification-list";
import { radius, spacing, useTheme } from "@/theme";
import { INotification, NotificationAction } from "@/types/notification";

/** The action's colour carries meaning only where the design system gives it one: liked = danger, repost = success */
function ActionBadge({ action }: { action: NotificationAction }) {
    const { colors } = useTheme();
    const badges: Record<NotificationAction, { background: string; icon: ReactNode }> = {
        like: { background: colors.danger, icon: <HeartIcon size={10} filled color="#ffffff" /> },
        repost: { background: colors.success, icon: <RepostIcon size={10} color="#000000" /> },
        comment: { background: colors.primary, icon: <CommentIcon size={10} filled color={colors.primaryForeground} /> },
        mention: { background: colors.primary, icon: <AtSign size={10} color={colors.primaryForeground} strokeWidth={3} /> },
        follow: { background: colors.primary, icon: <UserPlus size={10} color={colors.primaryForeground} strokeWidth={3} /> },
    };
    const { background, icon } = badges[action];

    return (
        <View
            style={{
                position: "absolute",
                right: -2,
                bottom: -2,
                width: 20,
                height: 20,
                borderRadius: radius.full,
                backgroundColor: background,
                borderWidth: 2,
                borderColor: colors.background,
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {icon}
        </View>
    );
}

/** "linh and 2 others liked your post · 2h", the first sender's avatar with the action's badge */
export const NotificationItem = memo(function NotificationItem({ notification }: { notification: INotification }) {
    const { t, i18n } = useTranslation(["app", "common"]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [first] = notification.senders;
    const others = notification.senders.length - 1;

    const remove = async () => {
        try {
            await deleteNotification(notification._id);
            invalidate("/notification");
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    return (
        <>
            <Pressable
                accessibilityRole="button"
                accessibilityHint={t("DELETE_NOTIFICATION_HINT")}
                onPress={() => openAppUrl(notification.url)}
                onLongPress={() => setIsMenuOpen(true)}
                style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing[3],
                    paddingHorizontal: spacing[4],
                    paddingVertical: spacing[3],
                    opacity: pressed ? 0.7 : 1,
                })}
            >
                <View>
                    <Avatar src={first?.photo ?? notification.photo} name={first?.username} />
                    <ActionBadge action={notification.action} />
                </View>
                <Text variant="small" style={{ flex: 1 }}>
                    <Text variant="small" weight={600}>
                        {first?.username ?? "Someone"}
                    </Text>
                    {others > 0 ? ` ${t("NOTIFICATION_AND_OTHERS", { count: others })}` : ""} {notification.message}{" "}
                    <Text variant="small" color="default500">
                        {formatShortTime(notification.createdAt, i18n.language)}
                    </Text>
                </Text>
            </Pressable>
            <ActionSheet
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                options={[{ label: t("DELETE_NOTIFICATION"), icon: Trash2, destructive: true, onPress: remove }]}
            />
        </>
    );
});
