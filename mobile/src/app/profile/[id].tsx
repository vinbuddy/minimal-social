import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useSWR from "swr";

import { ScreenHeader } from "@/components/screen-header";
import { Avatar, Text, UserName } from "@/components/ui";
import { fetcher } from "@/lib/http";
import { spacing, useTheme } from "@/theme";
import { IUser } from "@/types/user";

/** Where mentions and avatars lead. The full profile (posts, follow, edit) lands in Phase 4 */
export default function ProfileScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { t } = useTranslation();
    const { colors } = useTheme();
    const { data } = useSWR<{ data: IUser }>(`/user/${id}`, fetcher);
    const user = data?.data;

    return (
        <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
            <ScreenHeader title={user?.username ?? t("PROFILE")} />
            <View style={{ alignItems: "center", gap: spacing[3], padding: spacing[6] }}>
                <Avatar size="xl" src={user?.photo} name={user?.username} isBordered />
                <UserName username={user?.username} isVerified={user?.isVerified} />
                {user?.bio ? (
                    <Text variant="small" color="default500" style={{ textAlign: "center" }}>
                        {user.bio}
                    </Text>
                ) : null}
                <Text variant="tiny" color="default400">
                    Phase 4
                </Text>
            </View>
        </SafeAreaView>
    );
}
