import * as Clipboard from "expo-clipboard";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { ArrowDown, ChevronLeft, Copy, Info, Reply, Search, Trash2, Undo2 } from "lucide-react-native";
import { ComponentRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useSWR from "swr";

import { MessageComposer } from "@/components/chat/message-composer";
import { MessageItem } from "@/components/chat/message-item";
import { MediaGallery } from "@/components/post/media-gallery";
import { ActionSheet, ActionSheetOption, Avatar, Button, Divider, Text, toast, UserName } from "@/components/ui";
import { useConversationMessages } from "@/hooks/use-conversation-messages";
import { confirm } from "@/lib/confirm";
import { fetcher } from "@/lib/http";
import { goBack } from "@/lib/navigation";
import { richTextToPlain } from "@/lib/rich-text";
import { connectSocket } from "@/lib/socket";
import { getErrorMessage } from "@/services/auth";
import { conversationUrl, deleteMessage, reactToMessage, removeReaction, retractMessage } from "@/services/chat";
import useAuthStore from "@/stores/auth-store";
import { radius, spacing, useTheme } from "@/theme";
import { IConversation, IMessage, REACTIONS } from "@/types/chat";
import { IMediaFile } from "@/types/post";
import { IUser } from "@/types/user";

/** `seenBy` and reaction users may come back as ids or as users depending on the endpoint */
const idOf = (user: IUser | string) => (typeof user === "string" ? user : user._id);

export default function ChatScreen() {
    const { id, messageId } = useLocalSearchParams<{
        id: string;
        messageId?: string;
    }>();
    const { t } = useTranslation(["app", "common"]);
    const { colors } = useTheme();
    const currentUser = useAuthStore((state) => state.currentUser);
    const currentUserId = currentUser?._id ?? "";
    const listRef = useRef<ComponentRef<typeof FlatList<IMessage>>>(null);

    const { data, mutate: mutateConversation } = useSWR<{ data: IConversation }>(conversationUrl(id), fetcher);
    const conversation = data?.data;
    const other = conversation?.participants.find((participant) => participant._id !== currentUserId) ?? conversation?.participants[0];
    const otherName = other?.username ?? "";
    const isBlockedByMe = !!other && !!currentUser?.blockedUsers?.some((blocked) => idOf(blocked) === other._id);

    const chat = useConversationMessages(id, currentUser?._id, messageId);
    const { isFocusedRef } = chat;
    const [replyTo, setReplyTo] = useState<IMessage | null>(null);
    // Sheets keep their message while closing, so they don't empty out mid-fade
    const [menu, setMenu] = useState<{
        message: IMessage;
        isOpen: boolean;
    } | null>(null);
    const [reactionsSheet, setReactionsSheet] = useState<{
        message: IMessage;
        isOpen: boolean;
    } | null>(null);
    const [gallery, setGallery] = useState<{
        files: IMediaFile[];
        index: number;
    } | null>(null);
    const [isScrolledUp, setIsScrolledUp] = useState(false);

    // Theme or emoji changed, here or on the other side
    useEffect(() => {
        const socket = connectSocket();
        const onUpdate = (updated: IConversation) => {
            if (updated?._id === id) mutateConversation({ data: updated }, { revalidate: false });
        };
        socket.on("updateConversation", onUpdate);
        return () => {
            socket.off("updateConversation", onUpdate);
        };
    }, [id, mutateConversation]);

    // Messages that arrive while you're on another screen stay unread
    useFocusEffect(
        useCallback(() => {
            isFocusedRef.current = true;
            return () => {
                isFocusedRef.current = false;
            };
        }, [isFocusedRef]),
    );

    // Bring the found message into view once its page is in
    useEffect(() => {
        const index = chat.jumpedTo ? chat.messages.findIndex((message) => message._id === chat.jumpedTo) : -1;
        if (index >= 0)
            listRef.current?.scrollToIndex({
                index,
                viewPosition: 0.5,
                animated: true,
            });
    }, [chat.jumpedTo, chat.messages]);

    // Under each person's avatar: the latest of your messages they've seen, unless they've written since
    const seenUnder = useMemo(() => {
        const result = new Map<string, IUser[]>();
        for (const participant of conversation?.participants ?? []) {
            if (participant._id === currentUserId) continue;
            const seen = chat.messages.find(
                (message) => message.sender._id === participant._id || message.seenBy.some((user) => idOf(user) === participant._id),
            );
            if (seen && seen.sender._id === currentUserId) result.set(seen._id, [...(result.get(seen._id) ?? []), participant]);
        }
        return result;
    }, [chat.messages, conversation?.participants, currentUserId]);

    const onLongPress = useCallback((message: IMessage) => setMenu({ message, isOpen: true }), []);
    const onReactionsPress = useCallback((message: IMessage) => setReactionsSheet({ message, isOpen: true }), []);
    const closeMenu = () => setMenu((current) => current && { ...current, isOpen: false });
    const closeReactions = () => setReactionsSheet((current) => current && { ...current, isOpen: false });
    // The latest copy, as reactions change while a sheet is open
    const latest = (message: IMessage | undefined) => (message ? (chat.messages.find((candidate) => candidate._id === message._id) ?? message) : null);
    const menuFor = latest(menu?.message);
    const reactionsFor = latest(reactionsSheet?.message);
    const onOpenMedia = useCallback((message: IMessage, index: number) => setGallery({ files: message.mediaFiles, index }), []);

    const react = async (message: IMessage, emoji: string) => {
        closeMenu();
        const mine = message.reactions.find((reaction) => idOf(reaction.user) === currentUserId);
        try {
            chat.upsert([mine?.emoji === emoji ? await removeReaction(message._id) : await reactToMessage(message._id, emoji)]);
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    const menuOptions = (message: IMessage): ActionSheetOption[] => {
        const isMine = message.sender._id === currentUserId;
        const options: ActionSheetOption[] = [];
        if (message.isRetracted) return options;

        options.push({
            label: t("CHAT_REPLY"),
            icon: Reply,
            onPress: () => setReplyTo(message),
        });
        if (message.content) {
            options.push({
                label: t("CHAT_COPY"),
                icon: Copy,
                onPress: async () => {
                    await Clipboard.setStringAsync(richTextToPlain(message.content ?? ""));
                    toast.success(t("CHAT_COPIED"));
                },
            });
        }
        if (isMine) {
            options.push({
                label: t("CHAT_RETRACT"),
                icon: Undo2,
                destructive: true,
                onPress: async () => {
                    const ok = await confirm({
                        title: t("CHAT_RETRACT_TITLE"),
                        message: t("CHAT_RETRACT_MESSAGE"),
                        confirmLabel: t("CHAT_RETRACT"),
                        cancelLabel: t("common:CANCEL"),
                        destructive: true,
                    });
                    if (!ok) return;
                    try {
                        await retractMessage(message._id);
                        // The socket brings the retracted copy too; don't wait for it
                        chat.upsert([
                            {
                                ...message,
                                isRetracted: true,
                                content: null,
                                mediaFiles: [],
                                stickerUrl: null,
                                gifUrl: null,
                            },
                        ]);
                    } catch (error) {
                        toast.error(getErrorMessage(error));
                    }
                },
            });
            options.push({
                label: t("CHAT_DELETE_FOR_ME"),
                icon: Trash2,
                destructive: true,
                onPress: async () => {
                    const ok = await confirm({
                        title: t("CHAT_DELETE_TITLE"),
                        message: t("CHAT_DELETE_MESSAGE"),
                        confirmLabel: t("common:DELETE"),
                        cancelLabel: t("common:CANCEL"),
                        destructive: true,
                    });
                    if (!ok) return;
                    try {
                        await deleteMessage(message._id);
                        chat.remove(message._id);
                    } catch (error) {
                        toast.error(getErrorMessage(error));
                    }
                },
            });
        }
        return options;
    };

    const myReaction = menuFor?.reactions.find((reaction) => idOf(reaction.user) === currentUserId)?.emoji;
    const showJumpToLatest = !!chat.jumpedTo || isScrolledUp;

    return (
        <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing[1],
                    paddingHorizontal: spacing[2],
                    paddingVertical: spacing[1],
                    minHeight: 52,
                }}
            >
                <Button isIconOnly variant="light" color="default" radius="full" accessibilityLabel="Back" onPress={goBack}>
                    <ChevronLeft size={24} color={colors.foreground} />
                </Button>
                <Pressable
                    accessibilityRole="link"
                    disabled={!other}
                    onPress={() =>
                        other &&
                        router.push({
                            pathname: "/profile/[id]",
                            params: { id: other._id },
                        })
                    }
                    style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: spacing[2],
                    }}
                >
                    <Avatar size="sm" src={other?.photo} name={other?.username} />
                    {other ? <UserName username={other.username} isVerified={other.isVerified} /> : null}
                </Pressable>
                <Button
                    isIconOnly
                    variant="light"
                    color="default"
                    radius="full"
                    accessibilityLabel={t("CHAT_SEARCH")}
                    onPress={() =>
                        router.push({
                            pathname: "/conversations/[id]/search",
                            params: { id },
                        })
                    }
                >
                    <Search size={22} color={colors.foreground} />
                </Button>
                <Button
                    isIconOnly
                    variant="light"
                    color="default"
                    radius="full"
                    accessibilityLabel={t("CHAT_INFO")}
                    onPress={() =>
                        router.push({
                            pathname: "/conversations/[id]/info",
                            params: { id },
                        })
                    }
                >
                    <Info size={22} color={conversation?.theme?.color ?? colors.foreground} />
                </Button>
            </View>
            <Divider />

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <View style={{ flex: 1 }}>
                    {chat.isLoading && chat.messages.length === 0 ? (
                        <ActivityIndicator style={{ flex: 1 }} color={colors.default500} />
                    ) : chat.error && chat.messages.length === 0 ? (
                        <View
                            style={{
                                flex: 1,
                                alignItems: "center",
                                justifyContent: "center",
                                gap: spacing[3],
                            }}
                        >
                            <Text color="default500">{getErrorMessage(chat.error)}</Text>
                            <Button variant="bordered" color="default" onPress={chat.loadLatest}>
                                {t("TRY_AGAIN")}
                            </Button>
                        </View>
                    ) : (
                        <FlatList
                            ref={listRef}
                            data={chat.messages}
                            inverted
                            keyExtractor={(message) => message._id}
                            keyboardShouldPersistTaps="handled"
                            keyboardDismissMode="interactive"
                            contentContainerStyle={{ paddingVertical: spacing[3] }}
                            renderItem={({ item, index }) => (
                                <MessageItem
                                    message={item}
                                    // Newest first: the older neighbour is the next item
                                    older={chat.messages[index + 1]}
                                    newer={chat.messages[index - 1]}
                                    currentUserId={currentUserId}
                                    theme={conversation?.theme ?? null}
                                    otherName={otherName}
                                    seenBy={seenUnder.get(item._id) ?? []}
                                    isHighlighted={item._id === chat.jumpedTo}
                                    onLongPress={onLongPress}
                                    onOpenMedia={onOpenMedia}
                                    onReactionsPress={onReactionsPress}
                                />
                            )}
                            onEndReached={chat.loadOlder}
                            onEndReachedThreshold={0.3}
                            onScroll={(event) => setIsScrolledUp(event.nativeEvent.contentOffset.y > 600)}
                            scrollEventThrottle={100}
                            onScrollToIndexFailed={({ index, averageItemLength }) => {
                                listRef.current?.scrollToOffset({
                                    offset: index * averageItemLength,
                                    animated: false,
                                });
                                setTimeout(
                                    () =>
                                        listRef.current?.scrollToIndex({
                                            index,
                                            viewPosition: 0.5,
                                        }),
                                    100,
                                );
                            }}
                            ListFooterComponent={
                                chat.isLoadingOlder ? (
                                    <ActivityIndicator style={{ padding: spacing[4] }} color={colors.default500} />
                                ) : !chat.hasOlder && !chat.jumpedTo && other ? (
                                    <ChatIntro user={other} />
                                ) : undefined
                            }
                        />
                    )}

                    {showJumpToLatest ? (
                        <Pressable
                            accessibilityRole="button"
                            onPress={() => {
                                // Dropping the search param reloads the latest page
                                if (chat.jumpedTo) router.setParams({ messageId: undefined });
                                else listRef.current?.scrollToOffset({ offset: 0, animated: true });
                            }}
                            style={{
                                position: "absolute",
                                bottom: spacing[3],
                                alignSelf: "center",
                                flexDirection: "row",
                                alignItems: "center",
                                gap: spacing[1],
                                paddingHorizontal: spacing[3],
                                paddingVertical: spacing[2],
                                borderRadius: radius.full,
                                backgroundColor: colors.content1,
                                borderWidth: 1,
                                borderColor: colors.divider,
                            }}
                        >
                            <ArrowDown size={16} color={colors.foreground} />
                            <Text variant="small" weight={500}>
                                {t("CHAT_LATEST")}
                            </Text>
                        </Pressable>
                    ) : null}
                </View>

                {isBlockedByMe ? (
                    <View
                        style={{
                            padding: spacing[4],
                            gap: spacing[2],
                            alignItems: "center",
                        }}
                    >
                        <Divider />
                        <Text variant="small" color="default500" style={{ textAlign: "center" }}>
                            {t("CHAT_BLOCKED", { name: otherName })}
                        </Text>
                        <Button variant="bordered" color="default" size="sm" onPress={() => router.push("/settings/blocked")}>
                            {t("CHAT_MANAGE_BLOCKED")}
                        </Button>
                    </View>
                ) : (
                    <MessageComposer
                        conversationId={id}
                        emoji={conversation?.emoji ?? null}
                        replyTo={replyTo}
                        replyToName={replyTo?.sender._id === currentUserId ? t("CHAT_YOURSELF") : otherName}
                        onCancelReply={() => setReplyTo(null)}
                        onSent={(message) => {
                            // Sending from the middle of history: go back to the latest first
                            if (chat.jumpedTo) router.setParams({ messageId: undefined });
                            else chat.upsert([message]);
                            listRef.current?.scrollToOffset({ offset: 0, animated: true });
                        }}
                    />
                )}
            </KeyboardAvoidingView>

            <ActionSheet
                isOpen={!!menu?.isOpen}
                onClose={closeMenu}
                options={menuFor ? menuOptions(menuFor) : []}
                header={
                    menuFor && !menuFor.isRetracted ? (
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-evenly",
                                paddingHorizontal: spacing[4],
                                paddingBottom: spacing[3],
                            }}
                        >
                            {REACTIONS.map((emoji) => (
                                <Pressable
                                    key={emoji}
                                    accessibilityRole="button"
                                    accessibilityLabel={emoji}
                                    accessibilityState={{ selected: emoji === myReaction }}
                                    onPress={() => react(menuFor, emoji)}
                                    style={({ pressed }) => ({
                                        width: 48,
                                        height: 48,
                                        borderRadius: radius.full,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: emoji === myReaction ? colors.content3 : pressed ? colors.content2 : "transparent",
                                    })}
                                >
                                    <Text variant="emoji" style={{ fontSize: 28, lineHeight: 34 }}>
                                        {emoji}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    ) : null
                }
            />

            <ActionSheet
                isOpen={!!reactionsSheet?.isOpen}
                onClose={closeReactions}
                title={t("CHAT_REACTIONS_TITLE")}
                options={
                    reactionsFor?.reactions.some((reaction) => idOf(reaction.user) === currentUserId)
                        ? [
                              {
                                  label: t("CHAT_REMOVE_REACTION"),
                                  destructive: true,
                                  onPress: () =>
                                      reactionsFor &&
                                      react(reactionsFor, reactionsFor.reactions.find((reaction) => idOf(reaction.user) === currentUserId)!.emoji),
                              },
                          ]
                        : []
                }
                header={
                    <View
                        style={{
                            paddingHorizontal: spacing[4],
                            paddingBottom: spacing[2],
                            gap: spacing[3],
                        }}
                    >
                        {reactionsFor?.reactions.map((reaction) => {
                            const user =
                                typeof reaction.user === "string"
                                    ? conversation?.participants.find((participant) => participant._id === idOf(reaction.user))
                                    : reaction.user;
                            return (
                                <View
                                    key={idOf(reaction.user)}
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: spacing[3],
                                    }}
                                >
                                    <Avatar size="sm" src={user?.photo} name={user?.username} />
                                    <Text weight={500} style={{ flex: 1 }}>
                                        {idOf(reaction.user) === currentUserId ? t("CHAT_YOU") : user?.username}
                                    </Text>
                                    <Text variant="emoji">{reaction.emoji}</Text>
                                </View>
                            );
                        })}
                    </View>
                }
            />

            <MediaGallery mediaFiles={gallery?.files ?? []} initialIndex={gallery?.index ?? null} onClose={() => setGallery(null)} />
        </SafeAreaView>
    );
}

/** The top of the conversation: who you're talking to */
function ChatIntro({ user }: { user: IUser }) {
    const { t } = useTranslation("app");

    return (
        <View
            style={{
                alignItems: "center",
                gap: spacing[2],
                paddingVertical: spacing[6],
            }}
        >
            <Avatar size="xl" src={user.photo} name={user.username} />
            <UserName username={user.username} isVerified={user.isVerified} />
            <Button
                variant="bordered"
                color="default"
                size="sm"
                style={{ alignSelf: "center" }}
                onPress={() => router.push({ pathname: "/profile/[id]", params: { id: user._id } })}
            >
                {t("CHAT_VIEW_PROFILE")}
            </Button>
        </View>
    );
}
