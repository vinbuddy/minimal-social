import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useSWR from "swr";

import { CommentForm } from "@/components/comment/comment-form";
import { CommentItem } from "@/components/comment/comment-item";
import { PostItem } from "@/components/post/post-item";
import { ScreenHeader } from "@/components/screen-header";
import { Button, Divider, Skeleton, Text } from "@/components/ui";
import { usePagination } from "@/hooks/use-pagination";
import { fetcher } from "@/lib/http";
import { commentsUrl } from "@/services/comments";
import { spacing, useTheme } from "@/theme";
import { CommentTarget, IComment } from "@/types/comment";
import { IPost } from "@/types/post";

/** The post, then its comments (newest first, replies on demand), with the comment field pinned at the bottom */
export default function PostDetailScreen() {
    const { id, focus } = useLocalSearchParams<{ id: string; focus?: string }>();
    const { t } = useTranslation(["common", "comment", "app"]);
    const { colors } = useTheme();
    const [replyTo, setReplyTo] = useState<IComment | null>(null);

    const { data, error, isLoading, mutate } = useSWR<{ data: IPost }>(`/post/${id}`, fetcher);
    const post = data?.data;
    const target = useMemo<CommentTarget | null>(
        () => (post ? { type: "Post", id: post._id, ownerId: post.postBy._id, commentCount: post.commentCount ?? 0 } : null),
        [post]
    );
    const comments = usePagination<IComment>(target ? commentsUrl(target) : null);

    const renderComment = useCallback(
        ({ item }: { item: IComment }) =>
            target ? (
                <View style={{ paddingHorizontal: spacing[4] }}>
                    <CommentItem comment={item} target={target} onReply={setReplyTo} />
                </View>
            ) : null,
        [target]
    );

    return (
        <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
            <ScreenHeader title={t("POST")} />

            {isLoading ? (
                <View style={{ flexDirection: "row", gap: spacing[4], padding: spacing[4] }}>
                    <Skeleton width={40} height={40} radius="full" />
                    <View style={{ flex: 1, gap: spacing[2] }}>
                        <Skeleton width="40%" height={14} />
                        <Skeleton height={14} />
                        <Skeleton height={200} radius="large" />
                    </View>
                </View>
            ) : !post ? (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: spacing[3], padding: spacing[6] }}>
                    <Text color="default500">{error ? t("app:POST_NOT_FOUND") : null}</Text>
                    <Button variant="bordered" color="default" onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}>
                        {t("app:BACK")}
                    </Button>
                </View>
            ) : (
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                    <FlatList
                        data={comments.items}
                        keyExtractor={(comment) => comment._id}
                        renderItem={renderComment}
                        contentContainerStyle={{ paddingBottom: spacing[4] }}
                        keyboardShouldPersistTaps="handled"
                        ListHeaderComponent={
                            <View>
                                <PostItem post={post} variant="detail" onDeleted={() => router.back()} />
                                <Divider />
                            </View>
                        }
                        ListHeaderComponentStyle={{ marginBottom: spacing[2] }}
                        style={{ flex: 1 }}
                        onEndReached={comments.loadMore}
                        onEndReachedThreshold={0.5}
                        onRefresh={() => {
                            mutate();
                            comments.refresh();
                        }}
                        refreshing={false}
                        ListEmptyComponent={
                            comments.isLoading ? (
                                <ActivityIndicator style={{ padding: spacing[6] }} color={colors.default500} />
                            ) : (
                                <Text variant="small" color="default500" style={{ textAlign: "center", padding: spacing[6] }}>
                                    {t("comment:COMMENT_EMPTY")}
                                </Text>
                            )
                        }
                        ListFooterComponent={
                            comments.isLoadingMore && comments.items.length > 0 ? <ActivityIndicator style={{ padding: spacing[4] }} color={colors.default500} /> : undefined
                        }
                    />
                    <CommentForm target={target!} replyTo={replyTo} onCancelReply={() => setReplyTo(null)} autoFocus={focus === "comment"} />
                </KeyboardAvoidingView>
            )}
        </SafeAreaView>
    );
}
