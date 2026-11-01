import { ReactElement, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, RefreshControl, View } from "react-native";

import { Button, Divider, Skeleton, Text } from "@/components/ui";
import { usePagination } from "@/hooks/use-pagination";
import { getErrorMessage } from "@/services/auth";
import { usePostStateStore } from "@/stores/post-state-store";
import { spacing, useTheme } from "@/theme";
import { IPost } from "@/types/post";
import { PostItem } from "./post-item";

type PostListProps = {
    /** A paginated post endpoint: /post, /post/following, /post/user-post?... */
    url: string;
    header?: ReactElement;
};

/** An infinite, pull-to-refresh list of posts separated by hairlines */
export function PostList({ url, header }: PostListProps) {
    const { t } = useTranslation(["post", "common", "app"]);
    const { colors } = useTheme();
    const { items, error, isLoading, isLoadingMore, isReachedEnd, loadMore, refresh, isRefreshing } = usePagination<IPost>(url);
    const resetPostState = usePostStateStore((state) => state.reset);

    const onRefresh = useCallback(async () => {
        await refresh();
        // Fresh counts from the server replace the ones changed on this device
        resetPostState();
    }, [refresh, resetPostState]);

    const renderItem = useCallback(({ item }: { item: IPost }) => <PostItem post={item} />, []);

    return (
        <FlatList
            data={items}
            keyExtractor={(post) => post._id}
            renderItem={renderItem}
            ItemSeparatorComponent={Divider}
            ListHeaderComponent={header}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            refreshControl={<RefreshControl refreshing={isRefreshing && !isLoading} onRefresh={onRefresh} tintColor={colors.default500} />}
            ListEmptyComponent={
                isLoading ? (
                    <PostListSkeleton />
                ) : error ? (
                    <View style={{ alignItems: "center", gap: spacing[3], padding: spacing[12] }}>
                        <Text variant="small" color="default500" style={{ textAlign: "center" }}>
                            {getErrorMessage(error)}
                        </Text>
                        <Button size="sm" variant="bordered" color="default" onPress={() => refresh()}>
                            {t("app:TRY_AGAIN")}
                        </Button>
                    </View>
                ) : (
                    <Text variant="small" color="default500" style={{ textAlign: "center", padding: spacing[12] }}>
                        {t("POST_EMPTY")}
                    </Text>
                )
            }
            ListFooterComponent={
                items.length > 0 && !isReachedEnd && isLoadingMore ? (
                    <ActivityIndicator style={{ padding: spacing[6] }} color={colors.default500} />
                ) : undefined
            }
            // Posts are tall: keep fewer offscreen rows mounted (videos especially)
            windowSize={7}
            removeClippedSubviews
        />
    );
}

function PostListSkeleton() {
    return (
        <View>
            {[0, 1, 2].map((index) => (
                <View key={index}>
                    {index > 0 ? <Divider /> : null}
                    <View style={{ flexDirection: "row", gap: spacing[4], paddingVertical: spacing[5], paddingHorizontal: spacing[4] }}>
                        <Skeleton width={40} height={40} radius="full" />
                        <View style={{ flex: 1, gap: spacing[2] }}>
                            <Skeleton width="35%" height={14} />
                            <Skeleton height={14} />
                            <Skeleton width="75%" height={14} />
                            {index === 1 ? <Skeleton height={180} radius="large" /> : null}
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
}
