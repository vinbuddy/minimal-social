import { router, useLocalSearchParams } from "expo-router";
import { Search, X } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/screen-header";
import { Avatar, Divider, Input, Text, UserName } from "@/components/ui";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { usePagination } from "@/hooks/use-pagination";
import { richTextToPlain } from "@/lib/rich-text";
import { formatShortTime } from "@/lib/time";
import { messageSearchUrl } from "@/services/chat";
import { spacing, useTheme } from "@/theme";
import { IMessage } from "@/types/chat";

/** Text search in one conversation; tapping a result opens the chat around it */
export default function ConversationSearchScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { t, i18n } = useTranslation(["chat", "common"]);
    const { colors } = useTheme();
    const [search, setSearch] = useState("");
    const query = useDebouncedValue(search.trim(), 400);
    const results = usePagination<IMessage>(query ? messageSearchUrl(id, query) : null);

    return (
        <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
            <ScreenHeader title={t("CHAT.SEARCH_MESSAGE")} />
            <View style={{ padding: spacing[4] }}>
                <Input
                    value={search}
                    onChangeText={setSearch}
                    placeholder={t("CHAT.SEARCH_MESSAGE_PLACEHOLDER")}
                    autoFocus
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
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
            <Divider />

            {query ? (
                <FlatList
                    data={results.items}
                    keyExtractor={(message) => message._id}
                    keyboardShouldPersistTaps="handled"
                    ItemSeparatorComponent={() => (
                        <Divider
                            style={{
                                marginStart: spacing[4] + 32 + spacing[3],
                                width: undefined,
                            }}
                        />
                    )}
                    renderItem={({ item }) => (
                        <Pressable
                            accessibilityRole="button"
                            onPress={() =>
                                router.dismissTo({
                                    pathname: "/conversations/[id]",
                                    params: { id, messageId: item._id },
                                })
                            }
                            style={({ pressed }) => ({
                                flexDirection: "row",
                                gap: spacing[3],
                                paddingHorizontal: spacing[4],
                                paddingVertical: spacing[3],
                                backgroundColor: pressed ? colors.content2 : "transparent",
                            })}
                        >
                            <Avatar size="sm" src={item.sender.photo} name={item.sender.username} />
                            <View style={{ flex: 1, gap: 2 }}>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: spacing[2],
                                    }}
                                >
                                    <UserName username={item.sender.username} isVerified={item.sender.isVerified} />
                                    <Text variant="tiny" color="default500">
                                        {formatShortTime(item.createdAt, i18n.language)}
                                    </Text>
                                </View>
                                <Text variant="small" color="default600" numberOfLines={2}>
                                    {richTextToPlain(item.content ?? "")}
                                </Text>
                            </View>
                        </Pressable>
                    )}
                    onEndReached={results.loadMore}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={
                        results.isLoading ? (
                            <ActivityIndicator style={{ padding: spacing[6] }} color={colors.default500} />
                        ) : (
                            <Text variant="small" color="default500" style={{ textAlign: "center", padding: spacing[6] }}>
                                {t("common:NO_RESULT")}
                            </Text>
                        )
                    }
                    ListFooterComponent={
                        results.isLoadingMore && results.items.length > 0 ? (
                            <ActivityIndicator style={{ padding: spacing[4] }} color={colors.default500} />
                        ) : undefined
                    }
                />
            ) : null}
        </SafeAreaView>
    );
}
