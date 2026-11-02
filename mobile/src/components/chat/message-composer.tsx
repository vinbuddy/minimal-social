import { Image } from "expo-image";
import { ArrowUp, ImagePlus, Play, Sticker, X } from "lucide-react-native";
import { ComponentRef, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Divider, Text, toast } from "@/components/ui";
import { messagePreview } from "@/lib/chat-format";
import { MAX_MEDIA_FILES, pickMedia } from "@/lib/media-picker";
import { plainToRichText } from "@/lib/rich-text";
import { getErrorMessage } from "@/services/auth";
import { sendMessage } from "@/services/chat";
import { LocalMediaFile } from "@/services/posts";
import { fontFamily, radius, spacing, typography, useTheme } from "@/theme";
import { IMessage } from "@/types/chat";
import { StickerSheet } from "./sticker-sheet";

const DEFAULT_EMOJI = "👍";

type MessageComposerProps = {
    conversationId: string;
    /** The conversation's quick emoji, sent when the field is empty */
    emoji: string | null;
    replyTo: IMessage | null;
    /** Who `replyTo` is from, for the banner */
    replyToName: string;
    onCancelReply: () => void;
    onSent: (message: IMessage) => void;
};

/**
 * Messenger-style bar: photos and stickers on the left, the field, then Send, or the conversation's emoji while
 * there's nothing to send. Replying shows a banner above.
 */
export function MessageComposer({ conversationId, emoji, replyTo, replyToName, onCancelReply, onSent }: MessageComposerProps) {
    const { t } = useTranslation("app");
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
    const [text, setText] = useState("");
    const [mediaFiles, setMediaFiles] = useState<LocalMediaFile[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [isStickerOpen, setIsStickerOpen] = useState(false);

    useEffect(() => {
        if (replyTo) inputRef.current?.focus();
    }, [replyTo]);

    const hasContent = text.trim().length > 0 || mediaFiles.length > 0;

    const send = async (input: { content?: string; stickerUrl?: string; mediaFiles?: LocalMediaFile[] }) => {
        if (isSending) return;
        setIsSending(true);
        try {
            const message = await sendMessage({
                conversationId,
                replyTo: replyTo?._id,
                ...input,
            });
            onSent(message);
            onCancelReply();
            return true;
        } catch (error) {
            toast.error(getErrorMessage(error));
            return false;
        } finally {
            setIsSending(false);
        }
    };

    const sendTyped = async () => {
        const content = text.trim() ? plainToRichText(text, new Set()) : undefined;
        // Keep the field (and the keyboard) for the next message, as chat apps do
        if (await send({ content, mediaFiles })) {
            setText("");
            setMediaFiles([]);
        }
    };

    const addMedia = async () => {
        const { files, error } = await pickMedia(MAX_MEDIA_FILES - mediaFiles.length);
        if (error) toast.error(error);
        if (files.length > 0) setMediaFiles((current) => [...current, ...files]);
    };

    const previewLabels = {
        photo: t("CHAT_PHOTO"),
        sticker: t("CHAT_STICKER"),
        gif: "GIF",
        retracted: t("CHAT_RETRACTED"),
    };

    return (
        <View
            style={{
                backgroundColor: colors.background,
                paddingBottom: insets.bottom,
            }}
        >
            <Divider />
            {replyTo ? (
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: spacing[2],
                        paddingHorizontal: spacing[4],
                        paddingTop: spacing[2],
                    }}
                >
                    <View style={{ flex: 1 }}>
                        <Text variant="tiny" weight={600}>
                            {t("CHAT_REPLYING_TO", { name: replyToName })}
                        </Text>
                        <Text variant="tiny" color="default500" numberOfLines={1}>
                            {messagePreview(replyTo, previewLabels)}
                        </Text>
                    </View>
                    <Pressable accessibilityRole="button" accessibilityLabel={t("CHAT_CANCEL_REPLY")} hitSlop={10} onPress={onCancelReply}>
                        <X size={16} color={colors.default500} />
                    </Pressable>
                </View>
            ) : null}

            {mediaFiles.length > 0 ? (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                        gap: spacing[2],
                        paddingHorizontal: spacing[4],
                        paddingTop: spacing[2],
                    }}
                >
                    {mediaFiles.map((file, index) => (
                        <View
                            key={`${file.uri}-${index}`}
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: radius.medium,
                                overflow: "hidden",
                                backgroundColor: colors.content3,
                            }}
                        >
                            <Image source={{ uri: file.uri }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                            {file.type === "video" ? (
                                <View
                                    pointerEvents="none"
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Play size={18} color="#ffffff" fill="#ffffff" />
                                </View>
                            ) : null}
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={t("REMOVE_MEDIA")}
                                hitSlop={6}
                                onPress={() => setMediaFiles((current) => current.filter((_, i) => i !== index))}
                                style={{
                                    position: "absolute",
                                    top: 2,
                                    right: 2,
                                    width: 20,
                                    height: 20,
                                    borderRadius: radius.full,
                                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <X size={12} color="#ffffff" />
                            </Pressable>
                        </View>
                    ))}
                </ScrollView>
            ) : null}

            <View
                style={{
                    flexDirection: "row",
                    alignItems: "flex-end",
                    gap: spacing[1],
                    paddingHorizontal: spacing[2],
                    paddingVertical: spacing[2],
                }}
            >
                <Button
                    isIconOnly
                    variant="light"
                    color="default"
                    radius="full"
                    accessibilityLabel={t("CHAT_ADD_MEDIA")}
                    isDisabled={isSending || mediaFiles.length >= MAX_MEDIA_FILES}
                    onPress={addMedia}
                >
                    <ImagePlus size={22} color={colors.foreground} />
                </Button>
                <Button
                    isIconOnly
                    variant="light"
                    color="default"
                    radius="full"
                    accessibilityLabel={t("CHAT_STICKER")}
                    isDisabled={isSending}
                    onPress={() => setIsStickerOpen(true)}
                >
                    <Sticker size={22} color={colors.foreground} />
                </Button>
                <TextInput
                    ref={inputRef}
                    value={text}
                    onChangeText={setText}
                    multiline
                    maxLength={2000}
                    placeholder={t("CHAT_PLACEHOLDER")}
                    placeholderTextColor={colors.default500}
                    style={{
                        flex: 1,
                        maxHeight: 120,
                        minHeight: 36,
                        marginBottom: 2,
                        paddingHorizontal: spacing[3],
                        paddingTop: spacing[2],
                        paddingBottom: spacing[2],
                        borderRadius: radius.bubble,
                        backgroundColor: colors.content2,
                        color: colors.foreground,
                        fontFamily: fontFamily[400],
                        fontSize: typography.message.fontSize,
                    }}
                />
                {hasContent ? (
                    <Button
                        isIconOnly
                        size="sm"
                        radius="full"
                        isLoading={isSending}
                        accessibilityLabel={t("CHAT_SEND")}
                        onPress={sendTyped}
                        style={{ margin: 4 }}
                    >
                        <ArrowUp size={16} color={colors.primaryForeground} />
                    </Button>
                ) : (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t("CHAT_SEND_EMOJI", {
                            emoji: emoji ?? DEFAULT_EMOJI,
                        })}
                        disabled={isSending}
                        hitSlop={6}
                        onPress={() => send({ content: emoji ?? DEFAULT_EMOJI })}
                        style={({ pressed }) => ({
                            width: 40,
                            height: 40,
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: pressed || isSending ? 0.6 : 1,
                        })}
                    >
                        <Text variant="emoji">{emoji ?? DEFAULT_EMOJI}</Text>
                    </Pressable>
                )}
            </View>

            <StickerSheet
                isOpen={isStickerOpen}
                onClose={() => setIsStickerOpen(false)}
                onPick={(url) => {
                    setIsStickerOpen(false);
                    send({ stickerUrl: url });
                }}
            />
        </View>
    );
}
