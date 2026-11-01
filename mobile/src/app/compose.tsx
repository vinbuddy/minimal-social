import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Play, X } from "lucide-react-native";
import { ComponentRef, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { ImageIcon } from "@/components/icons";
import { MentionSuggestions } from "@/components/mention-suggestions";
import { Avatar, Button, Divider, Skeleton, Text, toast, UserName } from "@/components/ui";
import { useKeyboardHeight } from "@/hooks/use-keyboard-height";
import { useMentionInput } from "@/hooks/use-mention-input";
import { confirm } from "@/lib/confirm";
import { MAX_MEDIA_FILES, pickMedia } from "@/lib/media-picker";
import { richTextToPlain } from "@/lib/rich-text";
import { invalidate } from "@/lib/invalidate";
import { getErrorMessage } from "@/services/auth";
import { notify } from "@/services/notifications";
import { createPost, editPost, getPost, LocalMediaFile } from "@/services/posts";
import useAuthStore from "@/stores/auth-store";
import { fontFamily, radius, spacing, typography, useTheme } from "@/theme";
import { IMediaFile, IPost } from "@/types/post";

/** New post, or edit one with `?postId=` (caption only: the server can't change media after posting) */
export default function ComposeScreen() {
    const { postId } = useLocalSearchParams<{ postId?: string }>();
    const [editing, setEditing] = useState<IPost | null>(null);
    const [isLoadingPost, setIsLoadingPost] = useState(!!postId);

    useEffect(() => {
        if (!postId) return;
        getPost(postId)
            .then(setEditing)
            .catch((error) => {
                toast.error(getErrorMessage(error));
                leave();
            })
            .finally(() => setIsLoadingPost(false));
    }, [postId]);

    if (isLoadingPost) {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ padding: spacing[4], gap: spacing[3] }}>
                    <Skeleton width="40%" height={16} />
                    <Skeleton height={80} />
                </View>
            </SafeAreaView>
        );
    }

    // Keyed so the editor starts from the loaded caption
    return <Composer key={editing?._id ?? "new"} editing={editing} />;
}

function Composer({ editing }: { editing: IPost | null }) {
    const { t } = useTranslation(["app", "post", "common"]);
    const { colors } = useTheme();
    const currentUser = useAuthStore((state) => state.currentUser);
    const mention = useMentionInput(editing ? richTextToPlain(editing.caption) : "", editing?.mentions.map((user) => user.username) ?? []);
    const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
    const [mediaFiles, setMediaFiles] = useState<LocalMediaFile[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const insets = useSafeAreaInsets();
    const keyboardHeight = useKeyboardHeight();

    const hasText = mention.text.trim().length > 0;
    const isDirty = editing ? mention.text !== richTextToPlain(editing.caption) : hasText || mediaFiles.length > 0;
    const canSubmit = (hasText || mediaFiles.length > 0 || (editing?.mediaFiles.length ?? 0) > 0) && isDirty && !isSubmitting;

    const close = async () => {
        if (isDirty) {
            const isConfirmed = await confirm({ title: t("DISCARD_TITLE"), confirmLabel: t("DISCARD"), cancelLabel: t("KEEP_EDITING"), destructive: true });
            if (!isConfirmed) return;
        }
        leave();
    };

    const addMedia = async () => {
        const remaining = MAX_MEDIA_FILES - mediaFiles.length;
        if (remaining <= 0) {
            toast.error(t("MEDIA_LIMIT", { count: MAX_MEDIA_FILES }));
            return;
        }
        const { files, error } = await pickMedia(remaining);
        if (error) toast.error(error);
        if (files.length > 0) setMediaFiles((current) => [...current, ...files]);
    };

    const submit = async () => {
        if (!canSubmit) {
            if (!hasText && mediaFiles.length === 0) toast.error(t("POST_EMPTY_ERROR"));
            return;
        }

        setIsSubmitting(true);
        try {
            const caption = mention.toHtml();
            const post = editing ? await editPost(editing._id, caption) : await createPost(caption, mediaFiles);
            toast.success(t(editing ? "post:POST_EDITED_SUCCESS" : "post:POST_CREATED_SUCCESS"));
            invalidate("/post");

            // Only people newly mentioned are told, as on the web
            const alreadyMentioned = new Set(editing?.mentions.map((user) => user._id));
            notify(currentUser, {
                target: post._id,
                targetType: "Post",
                action: "mention",
                message: "mentioned you in a post",
                receivers: post.mentions.map((user) => user._id).filter((id) => !alreadyMentioned.has(id)),
                url: `/post/${post._id}`,
            });
            leave();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === "ios" ? 0 : insets.top }}>
            {/* Threads' sheet header: a text Cancel, the title centred */}
            <View style={{ flexDirection: "row", alignItems: "center", minHeight: 56, paddingHorizontal: spacing[4] }}>
                <Pressable accessibilityRole="button" hitSlop={10} onPress={close} style={{ minWidth: 72 }}>
                    <Text>{t("common:CANCEL")}</Text>
                </Pressable>
                <Text variant="large" weight={600} numberOfLines={1} accessibilityRole="header" style={{ flex: 1, textAlign: "center" }}>
                    {t(editing ? "EDIT_POST" : "NEW_POST")}
                </Text>
                <View style={{ minWidth: 72 }} />
            </View>
            <Divider />

            <View style={{ flex: 1, paddingBottom: keyboardHeight > 0 ? keyboardHeight : insets.bottom }}>
                <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: spacing[4] }}>
                    <View style={{ flexDirection: "row", gap: spacing[3] }}>
                        {/* Avatar with the thread line running down beside the post */}
                        <View style={{ alignItems: "center", gap: spacing[2] }}>
                            <Avatar src={currentUser?.photo} name={currentUser?.username} />
                            <View style={{ flex: 1, width: 2, minHeight: 24, borderRadius: radius.full, backgroundColor: colors.default200 }} />
                        </View>

                        <View style={{ flex: 1, gap: spacing[1] }}>
                            <UserName username={currentUser?.username} isVerified={currentUser?.isVerified} />
                            <TextInput
                                ref={inputRef}
                                {...mention.inputProps}
                                autoFocus
                                multiline
                                maxLength={5000}
                                placeholder={t("COMPOSER_PLACEHOLDER")}
                                placeholderTextColor={colors.default500}
                                editable={!isSubmitting}
                                style={{
                                    minHeight: 24,
                                    padding: 0,
                                    color: colors.foreground,
                                    fontFamily: fontFamily[400],
                                    fontSize: typography.body.fontSize,
                                    lineHeight: typography.body.lineHeight,
                                    textAlignVertical: "top",
                                }}
                            />

                            {editing ? (
                                <ExistingMedia files={editing.mediaFiles} note={t("MEDIA_READONLY")} />
                            ) : (
                                <PickedMedia files={mediaFiles} onRemove={(index) => setMediaFiles((current) => current.filter((_, i) => i !== index))} />
                            )}

                            {/* Attachment tools sit right under the text, as in Threads */}
                            {!editing ? (
                                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[1], marginStart: -spacing[2], marginTop: spacing[1] }}>
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                        color="default"
                                        radius="full"
                                        accessibilityLabel={t("ADD_MEDIA")}
                                        isDisabled={isSubmitting || mediaFiles.length >= MAX_MEDIA_FILES}
                                        onPress={addMedia}
                                    >
                                        <ImageIcon size={22} color={colors.default500} />
                                    </Button>
                                    {mediaFiles.length > 0 ? (
                                        <Text variant="tiny" color="default500">
                                            {mediaFiles.length}/{MAX_MEDIA_FILES}
                                        </Text>
                                    ) : null}
                                </View>
                            ) : null}
                        </View>
                    </View>
                </ScrollView>

                <MentionSuggestions
                    users={mention.suggestions}
                    onPick={(user) => {
                        mention.pickSuggestion(user);
                        inputRef.current?.focus();
                    }}
                />

                {/* Post sits just above the keyboard, where the thumb is */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[3], paddingHorizontal: spacing[4], paddingVertical: spacing[3] }}>
                    <Text variant="small" color="default500" style={{ flex: 1 }} numberOfLines={1}>
                        {editing ? t("EDIT_POST") : t("ADD_TO_POST")}
                    </Text>
                    <Button radius="full" isLoading={isSubmitting} isDisabled={!canSubmit} onPress={submit} style={{ paddingHorizontal: spacing[6] }}>
                        {editing ? t("common:SAVE") : t("PUBLISH")}
                    </Button>
                </View>
            </View>
        </View>
    );
}

const THUMB = 96;

function PickedMedia({ files, onRemove }: { files: LocalMediaFile[]; onRemove: (index: number) => void }) {
    const { t } = useTranslation("app");
    if (files.length === 0) return null;

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing[2], paddingStart: 40 + spacing[3] }}>
            {files.map((file, index) => (
                <View key={`${file.uri}-${index}`}>
                    <MediaThumb uri={file.uri} isVideo={file.type === "video"} />
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t("REMOVE_MEDIA")}
                        hitSlop={8}
                        onPress={() => onRemove(index)}
                        style={{
                            position: "absolute",
                            top: spacing[1],
                            right: spacing[1],
                            width: 22,
                            height: 22,
                            borderRadius: radius.full,
                            backgroundColor: "rgba(0, 0, 0, 0.6)",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <X size={14} color="#ffffff" />
                    </Pressable>
                </View>
            ))}
        </ScrollView>
    );
}

function ExistingMedia({ files, note }: { files: IMediaFile[]; note: string }) {
    if (files.length === 0) return null;

    return (
        <View style={{ gap: spacing[2], paddingStart: 40 + spacing[3] }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing[2] }}>
                {files.map((file) => (
                    <MediaThumb key={file.url} uri={file.url} isVideo={file.type === "video"} />
                ))}
            </ScrollView>
            <Text variant="tiny" color="default500">
                {note}
            </Text>
        </View>
    );
}

function MediaThumb({ uri, isVideo }: { uri: string; isVideo: boolean }) {
    const { colors } = useTheme();

    return (
        <View style={{ width: THUMB, height: THUMB * 1.25, borderRadius: radius.medium, overflow: "hidden", backgroundColor: colors.content3 }}>
            <Image source={{ uri }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
            {isVideo ? (
                <View style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" }}>
                    <Play size={24} color="#ffffff" fill="#ffffff" />
                </View>
            ) : null}
        </View>
    );
}

/** Back to where the composer was opened from; home when opened directly (deep link, web reload) */
function leave() {
    if (router.canGoBack()) router.back();
    else router.replace("/");
}
