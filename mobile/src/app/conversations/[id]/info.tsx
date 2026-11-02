import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Check, Play, Trash2 } from "lucide-react-native";
import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useSWR from "swr";

import { MediaGallery } from "@/components/post/media-gallery";
import { ScreenHeader } from "@/components/screen-header";
import { Avatar, Button, Divider, Text, toast, UserName } from "@/components/ui";
import { usePagination } from "@/hooks/use-pagination";
import { confirm } from "@/lib/confirm";
import { fetcher } from "@/lib/http";
import { invalidate } from "@/lib/invalidate";
import { getErrorMessage } from "@/services/auth";
import { changeConversationEmoji, changeConversationTheme, conversationMediaUrl, conversationUrl, deleteConversation } from "@/services/chat";
import useAuthStore from "@/stores/auth-store";
import { radius, spacing, useTheme } from "@/theme";
import { IConversation, ITheme } from "@/types/chat";
import { IMediaFile } from "@/types/post";

/** Quick emoji choices; the web's picker offers any, these cover the usual ones */
const EMOJI_CHOICES = ["👍", "❤️", "😂", "🔥", "😮", "😢", "🎉", "🙏", "👏", "💯", "✨", "☕"];
const MEDIA_COLUMNS = 3;

/** Conversation settings: who it's with, theme, quick emoji, shared media, delete */
export default function ConversationInfoScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { t } = useTranslation(["app", "chat", "common"]);
    const { colors } = useTheme();
    const { width } = useWindowDimensions();
    const currentUserId = useAuthStore((state) => state.currentUser?._id);
    const { data, mutate } = useSWR<{ data: IConversation }>(conversationUrl(id), fetcher);
    const { data: themes } = useSWR<{ data: ITheme[] }>("/theme", fetcher);
    const media = usePagination<IMediaFile>(conversationMediaUrl(id));
    const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const conversation = data?.data;
    const other = conversation?.participants.find((participant) => participant._id !== currentUserId) ?? conversation?.participants[0];
    const tile = (Math.min(width, 600) - 2 * (MEDIA_COLUMNS - 1)) / MEDIA_COLUMNS;

    const update = async (change: () => Promise<IConversation>) => {
        try {
            const updated = await change();
            // The chat screen hears it over the socket; this screen updates now
            mutate({ data: { ...conversation!, ...updated } }, { revalidate: false });
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    const remove = async () => {
        const ok = await confirm({
            title: t("chat:CHAT.SECURITY.DELETE_CONVERSATION"),
            message: t("CHAT_DELETE_CONVERSATION_MESSAGE"),
            confirmLabel: t("common:DELETE"),
            cancelLabel: t("common:CANCEL"),
            destructive: true,
        });
        if (!ok) return;
        setIsDeleting(true);
        try {
            await deleteConversation(id);
            invalidate("/conversation");
            router.dismissTo("/conversations");
        } catch (error) {
            toast.error(getErrorMessage(error));
            setIsDeleting(false);
        }
    };

    const header = !conversation ? (
        <ActivityIndicator style={{ padding: spacing[6] }} color={colors.default500} />
    ) : (
        <View>
            <View
                style={{
                    alignItems: "center",
                    gap: spacing[2],
                    paddingVertical: spacing[6],
                }}
            >
                <Avatar size="xl" src={other?.photo} name={other?.username} />
                {other ? <UserName username={other.username} isVerified={other.isVerified} /> : null}
                {other ? (
                    <Button
                        variant="bordered"
                        color="default"
                        size="sm"
                        style={{ alignSelf: "center" }}
                        onPress={() =>
                            router.push({
                                pathname: "/profile/[id]",
                                params: { id: other._id },
                            })
                        }
                    >
                        {t("CHAT_VIEW_PROFILE")}
                    </Button>
                ) : null}
            </View>
            <Divider />

            <Section title={t("CHAT_THEME")}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                        gap: spacing[3],
                        paddingHorizontal: spacing[4],
                    }}
                >
                    {(themes?.data ?? []).map((theme) => {
                        const isSelected = conversation.theme?._id === theme._id;
                        return (
                            <Pressable
                                key={theme._id}
                                accessibilityRole="radio"
                                accessibilityLabel={theme.name}
                                accessibilityState={{ checked: isSelected }}
                                onPress={() => !isSelected && update(() => changeConversationTheme(id, theme._id))}
                                style={{ alignItems: "center", gap: spacing[1], width: 64 }}
                            >
                                <View
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: radius.full,
                                        backgroundColor: theme.color,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderWidth: isSelected ? 3 : 0,
                                        borderColor: colors.foreground,
                                    }}
                                >
                                    {isSelected ? <Check size={20} color="#ffffff" /> : null}
                                </View>
                                <Text variant="tiny" color={isSelected ? "foreground" : "default500"} numberOfLines={1}>
                                    {theme.name}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </Section>
            <Divider />

            <Section title={t("chat:CHAT.SETTING.EMOJI")}>
                <View
                    style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: spacing[2],
                        paddingHorizontal: spacing[4],
                    }}
                >
                    {EMOJI_CHOICES.map((emoji) => {
                        const isSelected = (conversation.emoji ?? "👍") === emoji;
                        return (
                            <Pressable
                                key={emoji}
                                accessibilityRole="radio"
                                accessibilityLabel={emoji}
                                accessibilityState={{ checked: isSelected }}
                                onPress={() => !isSelected && update(() => changeConversationEmoji(id, emoji))}
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: radius.full,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: isSelected ? colors.content3 : colors.content2,
                                }}
                            >
                                <Text variant="emoji">{emoji}</Text>
                            </Pressable>
                        );
                    })}
                </View>
            </Section>
            <Divider />

            <Button
                variant="light"
                color="danger"
                startContent={<Trash2 size={18} color={colors.danger} />}
                isLoading={isDeleting}
                onPress={remove}
                style={{
                    justifyContent: "flex-start",
                    paddingHorizontal: spacing[4],
                    height: 52,
                }}
            >
                {t("chat:CHAT.SECURITY.DELETE_CONVERSATION")}
            </Button>
            <Divider />

            <Text
                weight={600}
                style={{
                    paddingHorizontal: spacing[4],
                    paddingTop: spacing[4],
                    paddingBottom: spacing[2],
                }}
            >
                {t("chat:CHAT.STORAGE.MEDIA_FILE")}
            </Text>
        </View>
    );

    return (
        <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
            <ScreenHeader title={t("CHAT_INFO")} />
            <FlatList
                data={conversation ? media.items : []}
                numColumns={MEDIA_COLUMNS}
                keyExtractor={(file, index) => file.publicId ?? `${file.url}-${index}`}
                columnWrapperStyle={{ gap: 2 }}
                contentContainerStyle={{ gap: 2, paddingBottom: spacing[6] }}
                ListHeaderComponent={header}
                renderItem={({ item, index }) => (
                    <Pressable
                        accessibilityRole="imagebutton"
                        onPress={() => setGalleryIndex(index)}
                        style={{
                            width: tile,
                            height: tile,
                            backgroundColor: item.type === "video" ? "#000000" : colors.content3,
                        }}
                    >
                        {item.type === "video" ? (
                            <View
                                style={{
                                    flex: 1,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Play size={22} color="#ffffff" fill="#ffffff" />
                            </View>
                        ) : (
                            <Image source={{ uri: item.url }} style={{ flex: 1 }} contentFit="cover" recyclingKey={item.url} />
                        )}
                    </Pressable>
                )}
                onEndReached={media.loadMore}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={
                    conversation && !media.isLoading ? (
                        <Text variant="small" color="default500" style={{ textAlign: "center", padding: spacing[6] }}>
                            {t("chat:CHAT.STORAGE.NO_MEDIA_FILE")}
                        </Text>
                    ) : undefined
                }
                ListFooterComponent={
                    media.isLoadingMore && conversation ? <ActivityIndicator style={{ padding: spacing[4] }} color={colors.default500} /> : undefined
                }
            />
            <MediaGallery mediaFiles={media.items} initialIndex={galleryIndex} onClose={() => setGalleryIndex(null)} />
        </SafeAreaView>
    );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <View style={{ paddingVertical: spacing[4], gap: spacing[3] }}>
            <Text weight={600} style={{ paddingHorizontal: spacing[4] }}>
                {title}
            </Text>
            {children}
        </View>
    );
}
