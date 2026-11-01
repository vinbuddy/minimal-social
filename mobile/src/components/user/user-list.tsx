import { ReactElement, ReactNode, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, View } from "react-native";

import { Divider, Skeleton, Text } from "@/components/ui";
import { usePagination } from "@/hooks/use-pagination";
import { spacing, useTheme } from "@/theme";
import { IUser } from "@/types/user";
import { UserRow } from "./user-row";

type UserListProps = {
    /** A paginated user endpoint: followers, following, blocked, suggestions */
    url: string | null;
    emptyText: string;
    header?: ReactElement;
    /** Replaces the Follow button on each row (e.g. Unblock) */
    renderAction?: (user: IUser) => ReactNode;
};

export function UserList({ url, emptyText, header, renderAction }: UserListProps) {
    const { colors } = useTheme();
    const { t } = useTranslation("common");
    const { items, isLoading, isLoadingMore, loadMore, error } = usePagination<IUser>(url);
    const renderItem = useCallback(({ item }: { item: IUser }) => <UserRow user={item} action={renderAction?.(item)} />, [renderAction]);

    return (
        <FlatList
            data={items}
            keyExtractor={(user) => user._id}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <Divider style={{ marginStart: spacing[4] + 40 + spacing[3], width: undefined }} />}
            ListHeaderComponent={header}
            keyboardShouldPersistTaps="handled"
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
                isLoading ? (
                    <View style={{ padding: spacing[4], gap: spacing[4] }}>
                        {[0, 1, 2].map((index) => (
                            <View key={index} style={{ flexDirection: "row", alignItems: "center", gap: spacing[3] }}>
                                <Skeleton width={40} height={40} radius="full" />
                                <Skeleton width="50%" height={14} />
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text variant="small" color="default500" style={{ textAlign: "center", padding: spacing[12] }}>
                        {error ? t("NO_RESULT") : emptyText}
                    </Text>
                )
            }
            ListFooterComponent={items.length > 0 && isLoadingMore ? <ActivityIndicator style={{ padding: spacing[4] }} color={colors.default500} /> : undefined}
        />
    );
}
