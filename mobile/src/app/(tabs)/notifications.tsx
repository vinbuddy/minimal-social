import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, View } from "react-native";

import { NotificationItem } from "@/components/notification/notification-item";
import { Divider, Screen, Skeleton, Text } from "@/components/ui";
import { usePagination } from "@/hooks/use-pagination";
import { markAllNotificationsRead, NotificationFilter, notificationsUrl } from "@/services/notification-list";
import useAuthStore from "@/stores/auth-store";
import { radius, spacing, useTheme } from "@/theme";
import { INotification } from "@/types/notification";

/** The web's filter tabs, as Threads' chips */
const FILTERS: { value: NotificationFilter; labelKey: string }[] = [
    { value: "all", labelKey: "NOTIFICATION_FILTER_ALL" },
    { value: "like", labelKey: "NOTIFICATION_FILTER_LIKE" },
    { value: "follow", labelKey: "NOTIFICATION_FILTER_FOLLOW" },
    { value: "comment", labelKey: "NOTIFICATION_FILTER_COMMENT" },
    { value: "mention", labelKey: "NOTIFICATION_FILTER_MENTION" },
    { value: "repost", labelKey: "NOTIFICATION_FILTER_REPOST" },
];

export default function NotificationsScreen() {
    const { t } = useTranslation("app");
    const { colors } = useTheme();
    const currentUser = useAuthStore((state) => state.currentUser);
    const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
    const [filter, setFilter] = useState<NotificationFilter>("all");
    const { items, isLoading, isLoadingMore, isRefreshing, loadMore, refresh } = usePagination<INotification>(
        currentUser ? notificationsUrl(currentUser._id, filter) : null
    );

    // Opening the tab reads them all, like the web: clears the dot on the tab and on other devices
    useFocusEffect(
        useCallback(() => {
            const user = useAuthStore.getState().currentUser;
            if (!user?.isNotification) return;

            setCurrentUser({ ...user, isNotification: false });
            markAllNotificationsRead(user._id).catch(() => {});
        }, [setCurrentUser])
    );

    return (
        <Screen edges={["top"]}>
            <Text variant="title" accessibilityRole="header" style={{ paddingHorizontal: spacing[4], paddingTop: spacing[2] }}>
                {t("NOTIFICATIONS")}
            </Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flexGrow: 0 }}
                contentContainerStyle={{ gap: spacing[2], paddingHorizontal: spacing[4], paddingVertical: spacing[3] }}
            >
                {FILTERS.map(({ value, labelKey }) => {
                    const isActive = value === filter;
                    return (
                        <Pressable
                            key={value}
                            accessibilityRole="tab"
                            accessibilityState={{ selected: isActive }}
                            onPress={() => setFilter(value)}
                            style={{
                                paddingHorizontal: spacing[4],
                                height: 34,
                                justifyContent: "center",
                                borderRadius: radius.medium,
                                borderWidth: 1,
                                borderColor: isActive ? colors.primary : colors.divider,
                                backgroundColor: isActive ? colors.primary : "transparent",
                            }}
                        >
                            <Text variant="small" weight={600} color={isActive ? "primaryForeground" : "foreground"}>
                                {t(labelKey)}
                            </Text>
                        </Pressable>
                    );
                })}
            </ScrollView>
            <Divider />

            <FlatList
                key={filter}
                data={items}
                keyExtractor={(notification) => notification._id}
                renderItem={({ item }) => <NotificationItem notification={item} />}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                refreshControl={<RefreshControl refreshing={isRefreshing && !isLoading} onRefresh={() => void refresh()} tintColor={colors.default500} />}
                ListEmptyComponent={
                    isLoading ? (
                        <View style={{ padding: spacing[4], gap: spacing[4] }}>
                            {[0, 1, 2, 3].map((index) => (
                                <View key={index} style={{ flexDirection: "row", alignItems: "center", gap: spacing[3] }}>
                                    <Skeleton width={40} height={40} radius="full" />
                                    <Skeleton width="65%" height={14} />
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text variant="small" color="default500" style={{ textAlign: "center", padding: spacing[12] }}>
                            {t("NO_NOTIFICATIONS")}
                        </Text>
                    )
                }
                ListFooterComponent={items.length > 0 && isLoadingMore ? <ActivityIndicator style={{ padding: spacing[4] }} color={colors.default500} /> : undefined}
            />
        </Screen>
    );
}
