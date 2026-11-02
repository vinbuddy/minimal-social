import { router, useFocusEffect } from "expo-router";
import { Search, X } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ConversationRow } from "@/components/chat/conversation-row";
import { ScreenHeader } from "@/components/screen-header";
import { Divider, Input, Skeleton, Text, toast } from "@/components/ui";
import { UserRow } from "@/components/user/user-row";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { usePagination } from "@/hooks/use-pagination";
import { invalidate } from "@/lib/invalidate";
import { connectSocket } from "@/lib/socket";
import { getErrorMessage } from "@/services/auth";
import { conversationsUrl, openConversationWith, searchConversations } from "@/services/chat";
import useAuthStore from "@/stores/auth-store";
import { spacing, useTheme } from "@/theme";
import { IConversation, IConversationSearchResult } from "@/types/chat";

export default function ConversationsScreen() {
    const { t } = useTranslation(["app", "chat", "common"]);
    const { colors } = useTheme();
    const currentUser = useAuthStore((state) => state.currentUser);
    const [search, setSearch] = useState("");
    const query = useDebouncedValue(search.trim(), 400);
    const { items, isLoading, isLoadingMore, isRefreshing, loadMore, refresh } = usePagination<IConversation>(conversationsUrl);

    // A new message anywhere moves its conversation up and changes its unread count
    useEffect(() => {
        const socket = connectSocket();
        const onNewMessage = () => invalidate("/conversation");
        socket.on("newMessage", onNewMessage);
        return () => {
            socket.off("newMessage", onNewMessage);
        };
    }, []);

    // Coming back from a chat: its unread count is now 0
    useFocusEffect(
        useCallback(() => {
            invalidate("/conversation");
        }, []),
    );

    return (
        <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
            <ScreenHeader title={t("MESSAGES")} />
            <View style={{ padding: spacing[4] }}>
                <Input
                    value={search}
                    onChangeText={setSearch}
                    placeholder={t("common:SEARCH")}
                    autoCapitalize="none"
                    autoCorrect={false}
                    startContent={<Search size={16} color={colors.default500} />}
                    endContent={
                        search ? (
                            <Pressable accessibilityRole="button" accessibilityLabel="Clear" hitSlop={8} onPress={() => setSearch("")}>
                                <X size={16} color={colors.default500} />
                            </Pressable>
                        ) : null
                    }
                />
            </View>

            {query ? (
                <PeopleToMessage query={query} currentUserId={currentUser?._id ?? ""} />
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(conversation) => conversation._id}
                    renderItem={({ item }) => <ConversationRow conversation={item} currentUserId={currentUser?._id ?? ""} />}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    refreshControl={<RefreshControl refreshing={isRefreshing && !isLoading} onRefresh={() => void refresh()} tintColor={colors.default500} />}
                    ListEmptyComponent={
                        isLoading ? (
                            <View style={{ paddingHorizontal: spacing[4], gap: spacing[4] }}>
                                {[0, 1, 2].map((index) => (
                                    <View
                                        key={index}
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            gap: spacing[3],
                                        }}
                                    >
                                        <Skeleton width={56} height={56} radius="full" />
                                        <View style={{ flex: 1, gap: spacing[2] }}>
                                            <Skeleton width="40%" height={14} />
                                            <Skeleton width="70%" height={12} />
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <Text variant="small" color="default500" style={{ textAlign: "center", padding: spacing[12] }}>
                                {t("chat:CHAT.NO_CONVERSATION")}
                            </Text>
                        )
                    }
                    ListFooterComponent={
                        items.length > 0 && isLoadingMore ? <ActivityIndicator style={{ padding: spacing[4] }} color={colors.default500} /> : undefined
                    }
                />
            )}
        </SafeAreaView>
    );
}

/** People matching the search; tapping one opens your conversation with them, creating it if needed */
function PeopleToMessage({ query, currentUserId }: { query: string; currentUserId: string }) {
    const { t } = useTranslation("common");
    const { colors } = useTheme();
    const [results, setResults] = useState<{
        query: string;
        data: IConversationSearchResult;
    } | null>(null);

    useEffect(() => {
        let isCancelled = false;
        searchConversations(query)
            .then((data) => !isCancelled && setResults({ query, data }))
            .catch(
                () =>
                    !isCancelled &&
                    setResults({
                        query,
                        data: { privateConversations: [], groupConversations: [] },
                    }),
            );
        return () => {
            isCancelled = true;
        };
    }, [query]);

    const open = async (userId: string) => {
        try {
            const id = await openConversationWith(currentUserId, userId);
            router.push({ pathname: "/conversations/[id]", params: { id } });
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    if (!results || results.query !== query) return <ActivityIndicator style={{ padding: spacing[6] }} color={colors.default500} />;

    const people = results.data.privateConversations.filter(({ user }) => user._id !== currentUserId);

    return (
        <FlatList
            data={people}
            keyExtractor={({ user }) => user._id}
            keyboardShouldPersistTaps="handled"
            ItemSeparatorComponent={() => (
                <Divider
                    style={{
                        marginStart: spacing[4] + 40 + spacing[3],
                        width: undefined,
                    }}
                />
            )}
            renderItem={({ item }) => (
                <Pressable onPress={() => open(item.user._id)}>
                    <View pointerEvents="none">
                        <UserRow user={item.user} showFollow={false} />
                    </View>
                </Pressable>
            )}
            ListEmptyComponent={
                <Text variant="small" color="default500" style={{ textAlign: "center", padding: spacing[6] }}>
                    {t("NO_RESULT")}
                </Text>
            }
        />
    );
}
