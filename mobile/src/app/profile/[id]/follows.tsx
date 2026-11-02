import { useLocalSearchParams } from "expo-router";
import { Search } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useSWR from "swr";

import { ScreenHeader } from "@/components/screen-header";
import { Input, Text } from "@/components/ui";
import { UserList } from "@/components/user/user-list";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { fetcher } from "@/lib/http";
import { followListUrl, userUrl } from "@/services/users";
import { borderWidth, spacing, useTheme } from "@/theme";
import { IUser } from "@/types/user";

type FollowType = "follower" | "following";

/** Followers / Following of a user, with a search box (the web's follow info modal as a screen) */
export default function FollowsScreen() {
    const { id, type: initialType } = useLocalSearchParams<{ id: string; type?: FollowType }>();
    const { t } = useTranslation(["user", "app", "common"]);
    const { colors } = useTheme();
    const [type, setType] = useState<FollowType>(initialType === "following" ? "following" : "follower");
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebouncedValue(search.trim(), 400);
    const { data } = useSWR<{ data: IUser }>(userUrl(id), fetcher);
    const user = data?.data;

    const labels: Record<FollowType, string> = {
        follower: `${user?.followerCount ?? ""} ${t("USER.FOLLOWER")}`.trim(),
        following: `${user?.followingCount ?? ""} ${t("USER.FOLLOWING")}`.trim(),
    };

    return (
        <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
            <ScreenHeader title={user?.username ?? ""} />
            <View accessibilityRole="tablist" style={{ flexDirection: "row", borderBottomWidth: borderWidth.divider, borderBottomColor: colors.divider }}>
                {(["follower", "following"] as FollowType[]).map((item) => {
                    const isActive = item === type;
                    return (
                        <Pressable
                            key={item}
                            accessibilityRole="tab"
                            accessibilityState={{ selected: isActive }}
                            onPress={() => setType(item)}
                            style={{
                                flex: 1,
                                alignItems: "center",
                                paddingVertical: spacing[3],
                                borderBottomWidth: borderWidth.medium,
                                borderBottomColor: isActive ? colors.foreground : "transparent",
                                marginBottom: -borderWidth.divider,
                            }}
                        >
                            <Text variant="small" weight={600} color={isActive ? "foreground" : "default500"}>
                                {labels[item]}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            {/* Outside the list, which remounts per search, so typing keeps focus */}
            <View style={{ padding: spacing[4] }}>
                <Input
                    value={search}
                    onChangeText={setSearch}
                    placeholder={t("common:SEARCH")}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                    startContent={<Search size={16} color={colors.default500} />}
                />
            </View>
            <UserList
                key={`${type}-${debouncedSearch}`}
                url={followListUrl(id, type, debouncedSearch)}
                emptyText={t(type === "follower" ? "app:NO_FOLLOWERS" : "app:NO_FOLLOWING")}
            />
        </SafeAreaView>
    );
}
