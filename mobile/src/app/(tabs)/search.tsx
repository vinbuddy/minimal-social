import { useLocalSearchParams } from "expo-router";
import { ChevronLeft, Search as SearchIcon, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";

import { PostList } from "@/components/post/post-list";
import { Button, Divider, Input, Screen, Text } from "@/components/ui";
import { UserList } from "@/components/user/user-list";
import { UserRow } from "@/components/user/user-row";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { autocompleteUsers, suggestionsUrl } from "@/services/users";
import useAuthStore from "@/stores/auth-store";
import { spacing, useTheme } from "@/theme";
import { IUser } from "@/types/user";

/**
 * The web's search: suggestions when empty, matching people while typing, and post results for a submitted
 * query. Hashtag links open here with `?query=tag`.
 */
export default function SearchScreen() {
    const { query } = useLocalSearchParams<{ query?: string }>();
    // A new hashtag tapped elsewhere starts a fresh search
    return <SearchContent key={query ?? ""} initialQuery={query} />;
}

function SearchContent({ initialQuery }: { initialQuery?: string }) {
    const { t } = useTranslation(["common", "app"]);
    const { colors } = useTheme();
    const currentUser = useAuthStore((state) => state.currentUser);
    const [text, setText] = useState(initialQuery ?? "");
    const [submitted, setSubmitted] = useState<string | null>(initialQuery ? initialQuery.replace(/^#/, "") : null);

    const submit = (value: string) => {
        const trimmed = value.trim().replace(/^#/, "");
        if (trimmed) setSubmitted(trimmed);
    };

    if (submitted) {
        return (
            <Screen edges={["top"]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[1], paddingHorizontal: spacing[2], minHeight: 52 }}>
                    <Button isIconOnly variant="light" color="default" radius="full" accessibilityLabel={t("app:BACK")} onPress={() => setSubmitted(null)}>
                        <ChevronLeft size={24} color={colors.foreground} />
                    </Button>
                    <Text weight={600} numberOfLines={1} style={{ flex: 1 }}>
                        {t("SEARCHING_FOR")}: {submitted}
                    </Text>
                </View>
                <Divider />
                <PostList url={`/search/post?query=${encodeURIComponent(submitted)}`} />
            </Screen>
        );
    }

    const query = text.trim();

    return (
        <Screen edges={["top"]}>
            <View style={{ paddingHorizontal: spacing[4], paddingTop: spacing[2], paddingBottom: spacing[3], gap: spacing[3] }}>
                <Text variant="title" accessibilityRole="header">
                    {t("SEARCH")}
                </Text>
                <Input
                    value={text}
                    onChangeText={setText}
                    placeholder={t("SEARCH")}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                    onSubmitEditing={() => submit(text)}
                    startContent={<SearchIcon size={16} color={colors.default500} />}
                    endContent={
                        text ? (
                            <Pressable accessibilityRole="button" accessibilityLabel="Clear" hitSlop={8} onPress={() => setText("")}>
                                <X size={16} color={colors.default500} />
                            </Pressable>
                        ) : null
                    }
                />
            </View>

            {query ? (
                <PeopleResults query={query} onSearchPosts={() => submit(query)} />
            ) : currentUser ? (
                <UserList
                    url={suggestionsUrl(currentUser._id)}
                    emptyText={t("NO_RESULT")}
                    header={
                        <Text variant="small" weight={600} color="default500" style={{ paddingHorizontal: spacing[4], paddingVertical: spacing[2] }}>
                            {t("app:SUGGESTED_FOR_YOU")}
                        </Text>
                    }
                />
            ) : null}
        </Screen>
    );
}

/** Up to 10 usernames matching the text, after a "Search for …" row that opens post results */
function PeopleResults({ query, onSearchPosts }: { query: string; onSearchPosts: () => void }) {
    const { t } = useTranslation(["common", "app"]);
    const { colors } = useTheme();
    const debouncedQuery = useDebouncedValue(query, 300);
    const [results, setResults] = useState<{ query: string; users: IUser[] } | null>(null);

    useEffect(() => {
        let isCancelled = false;
        autocompleteUsers(debouncedQuery)
            .then((users) => !isCancelled && setResults({ query: debouncedQuery, users }))
            .catch(() => !isCancelled && setResults({ query: debouncedQuery, users: [] }));
        return () => {
            isCancelled = true;
        };
    }, [debouncedQuery]);

    const isStale = results?.query !== debouncedQuery;

    return (
        <FlatList
            data={results && !isStale ? results.users : []}
            keyExtractor={(user) => user._id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => <UserRow user={item} showFollow={false} />}
            ItemSeparatorComponent={() => <Divider style={{ marginStart: spacing[4] + 40 + spacing[3], width: undefined }} />}
            ListHeaderComponent={
                <View>
                    <Pressable
                        accessibilityRole="button"
                        onPress={onSearchPosts}
                        style={({ pressed }) => ({
                            flexDirection: "row",
                            alignItems: "center",
                            gap: spacing[3],
                            paddingHorizontal: spacing[4],
                            paddingVertical: spacing[3],
                            backgroundColor: pressed ? colors.content2 : "transparent",
                        })}
                    >
                        <View style={{ width: 40, alignItems: "center" }}>
                            <SearchIcon size={20} color={colors.foreground} />
                        </View>
                        <Text numberOfLines={1} style={{ flex: 1 }}>
                            {t("app:SEARCH_POSTS_FOR", { query })}
                        </Text>
                    </Pressable>
                    <Divider />
                </View>
            }
            ListEmptyComponent={
                isStale ? (
                    <ActivityIndicator style={{ padding: spacing[6] }} color={colors.default500} />
                ) : (
                    <Text variant="small" color="default500" style={{ textAlign: "center", padding: spacing[6] }}>
                        {t("NO_RESULT")}
                    </Text>
                )
            }
        />
    );
}
