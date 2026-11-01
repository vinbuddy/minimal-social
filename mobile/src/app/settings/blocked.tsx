import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/screen-header";
import { Button, toast } from "@/components/ui";
import { UserList } from "@/components/user/user-list";
import { confirm } from "@/lib/confirm";
import { invalidate } from "@/lib/invalidate";
import { getErrorMessage } from "@/services/auth";
import { blockedUsersUrl, unblockUser } from "@/services/users";
import useAuthStore from "@/stores/auth-store";
import { useTheme } from "@/theme";
import { IUser } from "@/types/user";

/** People you blocked, each with Unblock */
export default function BlockedUsersScreen() {
    const { t } = useTranslation(["user", "common", "app"]);
    const { colors } = useTheme();

    const unblock = async (user: IUser) => {
        const isConfirmed = await confirm({
            title: t("USER.SETTING.UNBLOCK_CONFIRMATION", { username: user.username }),
            confirmLabel: t("USER.UNBLOCK_USER"),
            cancelLabel: t("common:CANCEL"),
        });
        if (!isConfirmed) return;

        try {
            await unblockUser(user._id);
            const currentUser = useAuthStore.getState().currentUser;
            if (currentUser) {
                useAuthStore.getState().setCurrentUser({ ...currentUser, blockedUsers: currentUser.blockedUsers.filter((blocked) => blocked._id !== user._id) });
            }
            invalidate(blockedUsersUrl);
            invalidate("/user");
            invalidate("/post");
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    return (
        <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
            <ScreenHeader title={t("USER.SETTING.BLOCKED_USER")} />
            <UserList
                url={blockedUsersUrl}
                emptyText={t("app:NO_BLOCKED_USERS")}
                renderAction={(user) => (
                    <Button size="sm" variant="bordered" color="default" onPress={() => unblock(user)}>
                        {t("USER.UNBLOCK_USER")}
                    </Button>
                )}
            />
        </SafeAreaView>
    );
}
