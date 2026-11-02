import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { Check, Music2, Video } from "lucide-react-native";
import { ComponentRef, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useSWR from "swr";

import { MentionSuggestions } from "@/components/mention-suggestions";
import { Button, Divider, Text, toast } from "@/components/ui";
import { useKeyboardHeight } from "@/hooks/use-keyboard-height";
import { useMentionInput } from "@/hooks/use-mention-input";
import { confirm } from "@/lib/confirm";
import { fetcher } from "@/lib/http";
import { invalidate } from "@/lib/invalidate";
import { setPlayerMuted } from "@/lib/video-player";
import { goBack } from "@/lib/navigation";
import { getErrorMessage } from "@/services/auth";
import { notify } from "@/services/notifications";
import { audioUrl, createReel, LocalVideo, REEL_MAX_DURATION, REEL_MAX_MB, savedAudiosUrl, uploadReelVideo } from "@/services/reels";
import useAuthStore from "@/stores/auth-store";
import { fontFamily, radius, spacing, typography, useTheme } from "@/theme";
import { IReelAudio } from "@/types/reel";

const PREVIEW_WIDTH = 120;

type Stage = { kind: "idle" } | { kind: "uploading"; fraction: number } | { kind: "processing" };

/** New reel: pick a video, write a caption, keep its sound or use a saved one (`?audioId=` preselects one) */
export default function CreateReelScreen() {
    const { audioId } = useLocalSearchParams<{ audioId?: string }>();
    const { t } = useTranslation(["reel", "app", "common"]);
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const keyboardHeight = useKeyboardHeight();
    const currentUser = useAuthStore((state) => state.currentUser);
    const mention = useMentionInput();
    const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
    const abortRef = useRef<AbortController | null>(null);
    const [video, setVideo] = useState<LocalVideo | null>(null);
    const [selectedAudioId, setSelectedAudioId] = useState<string | null>(audioId ?? null);
    const [stage, setStage] = useState<Stage>({ kind: "idle" });

    const { data: saved } = useSWR<{ data: IReelAudio[] }>(`${savedAudiosUrl}?page=1&limit=20`, fetcher);
    const { data: preset } = useSWR<{ data: IReelAudio }>(audioId ? audioUrl(audioId) : null, fetcher);
    const audios = [...(preset?.data ? [preset.data] : []), ...(saved?.data ?? []).filter((audio) => audio._id !== preset?.data?._id)];
    const isBusy = stage.kind !== "idle";

    // Abandoning the screen mid-upload stops the upload
    useEffect(() => () => abortRef.current?.abort(), []);

    const pickVideo = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["videos"],
            allowsMultipleSelection: false,
            videoMaxDuration: REEL_MAX_DURATION,
        });
        const asset = result.canceled ? null : result.assets[0];
        if (!asset) return;

        // The server rejects these after the upload; say so before spending it
        if (asset.duration && asset.duration / 1000 > REEL_MAX_DURATION + 0.5) {
            toast.error(t("REEL_UPLOAD.TOO_LONG", { duration: REEL_MAX_DURATION }));
            return;
        }
        if (asset.fileSize && asset.fileSize > REEL_MAX_MB * 1024 * 1024) {
            toast.error(t("REEL_UPLOAD.TOO_LARGE", { size: REEL_MAX_MB }));
            return;
        }
        setVideo({ uri: asset.uri, name: asset.fileName ?? `reel-${Date.now()}.mp4`, mimeType: asset.mimeType ?? "video/mp4" });
    };

    const close = async () => {
        if (video) {
            const ok = await confirm({
                title: t("REEL_UPLOAD.DISCARD_TITLE"),
                confirmLabel: t("REEL_UPLOAD.DISCARD"),
                cancelLabel: t("app:KEEP_EDITING"),
                destructive: true,
            });
            if (!ok) return;
        }
        abortRef.current?.abort();
        goBack();
    };

    const share = async () => {
        if (!video || isBusy) return;
        const controller = new AbortController();
        abortRef.current = controller;
        setStage({ kind: "uploading", fraction: 0 });

        try {
            const publicId = await uploadReelVideo(video, (fraction) => setStage({ kind: "uploading", fraction }), controller.signal);
            setStage({ kind: "processing" });
            const reel = await createReel({ publicId, caption: mention.toHtml(), audioId: selectedAudioId ?? undefined });

            toast.success(t("REEL_UPLOAD.SUCCESS"));
            invalidate("/reel");
            notify(currentUser, {
                target: reel._id,
                targetType: "Reel",
                action: "mention",
                message: "mentioned you in a reel",
                receivers: reel.mentions,
                url: `/reels/${reel._id}`,
            });
            router.replace({ pathname: "/reels/[id]", params: { id: reel._id } });
        } catch (error) {
            if (controller.signal.aborted) return;
            toast.error(`${t("REEL_UPLOAD.FAILED")}: ${getErrorMessage(error)}`);
            setStage({ kind: "idle" });
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === "ios" ? 0 : insets.top }}>
            <View style={{ flexDirection: "row", alignItems: "center", minHeight: 56, paddingHorizontal: spacing[4] }}>
                <Pressable accessibilityRole="button" hitSlop={10} onPress={close} style={{ minWidth: 72 }}>
                    <Text>{t("common:CANCEL")}</Text>
                </Pressable>
                <Text variant="large" weight={600} numberOfLines={1} accessibilityRole="header" style={{ flex: 1, textAlign: "center" }}>
                    {t("REEL_UPLOAD.TITLE")}
                </Text>
                <View style={{ minWidth: 72 }} />
            </View>
            <Divider />

            <View style={{ flex: 1, paddingBottom: keyboardHeight > 0 ? keyboardHeight : insets.bottom }}>
                <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: spacing[4], gap: spacing[6] }}>
                    <View style={{ flexDirection: "row", gap: spacing[4] }}>
                        {video ? (
                            <View style={{ gap: spacing[2] }}>
                                <VideoPreview uri={video.uri} isMuted={!!selectedAudioId} />
                                <Button size="sm" variant="light" color="default" isDisabled={isBusy} onPress={pickVideo}>
                                    {t("REEL_UPLOAD.CHANGE_VIDEO")}
                                </Button>
                            </View>
                        ) : (
                            <Pressable
                                accessibilityRole="button"
                                onPress={pickVideo}
                                style={({ pressed }) => ({
                                    width: PREVIEW_WIDTH,
                                    aspectRatio: 9 / 16,
                                    borderRadius: radius.medium,
                                    borderWidth: 1,
                                    borderStyle: "dashed",
                                    borderColor: colors.default300,
                                    backgroundColor: pressed ? colors.content2 : "transparent",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: spacing[2],
                                    padding: spacing[2],
                                })}
                            >
                                <Video size={28} color={colors.default500} />
                                <Text variant="tiny" color="default500" style={{ textAlign: "center" }}>
                                    {t("REEL_UPLOAD.SELECT_VIDEO")}
                                </Text>
                            </Pressable>
                        )}

                        <TextInput
                            ref={inputRef}
                            {...mention.inputProps}
                            multiline
                            maxLength={2200}
                            editable={!isBusy}
                            placeholder={t("REEL_UPLOAD.CAPTION_PLACEHOLDER")}
                            placeholderTextColor={colors.default500}
                            style={{
                                flex: 1,
                                minHeight: 120,
                                padding: 0,
                                color: colors.foreground,
                                fontFamily: fontFamily[400],
                                fontSize: typography.body.fontSize,
                                lineHeight: typography.body.lineHeight,
                                textAlignVertical: "top",
                            }}
                        />
                    </View>

                    <Text variant="tiny" color="default500">
                        {t("REEL_UPLOAD.REQUIREMENTS", { duration: REEL_MAX_DURATION, size: REEL_MAX_MB })}
                    </Text>

                    <View style={{ gap: spacing[2] }}>
                        <Text weight={600}>{t("REEL_UPLOAD.AUDIO")}</Text>
                        <AudioOption
                            label={t("REEL_UPLOAD.USE_ORIGINAL_AUDIO")}
                            isSelected={!selectedAudioId}
                            isDisabled={isBusy}
                            onPress={() => setSelectedAudioId(null)}
                        />
                        {audios.map((audio) => (
                            <AudioOption
                                key={audio._id}
                                label={`${audio.title ?? t("AUDIO.ORIGINAL")} · ${audio.owner.username}`}
                                coverUrl={audio.coverUrl}
                                isSelected={selectedAudioId === audio._id}
                                isDisabled={isBusy}
                                onPress={() => setSelectedAudioId(audio._id)}
                            />
                        ))}
                        <Text variant="tiny" color="default500">
                            {audios.length === 0
                                ? t("REEL_UPLOAD.NO_SAVED_AUDIOS")
                                : selectedAudioId
                                  ? t("REEL_UPLOAD.AUDIO_REPLACES")
                                  : t("REEL_UPLOAD.SAVED_AUDIOS")}
                        </Text>
                    </View>
                </ScrollView>

                <MentionSuggestions
                    users={mention.suggestions}
                    onPick={(user) => {
                        mention.pickSuggestion(user);
                        inputRef.current?.focus();
                    }}
                />

                {stage.kind !== "idle" ? (
                    <View style={{ paddingHorizontal: spacing[4], gap: spacing[1] }}>
                        <Text variant="tiny" color="default500">
                            {stage.kind === "uploading"
                                ? t("REEL_UPLOAD.UPLOADING", { percent: Math.round(stage.fraction * 100) })
                                : t("REEL_UPLOAD.PROCESSING")}
                        </Text>
                        <View style={{ height: 3, borderRadius: radius.full, backgroundColor: colors.content3, overflow: "hidden" }}>
                            <View
                                style={{
                                    height: "100%",
                                    width: stage.kind === "uploading" ? `${stage.fraction * 100}%` : "100%",
                                    backgroundColor: colors.foreground,
                                    opacity: stage.kind === "processing" ? 0.5 : 1,
                                }}
                            />
                        </View>
                    </View>
                ) : null}

                <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: spacing[4], paddingVertical: spacing[3] }}>
                    <Button radius="full" isLoading={isBusy} isDisabled={!video} onPress={share} style={{ paddingHorizontal: spacing[6] }}>
                        {t("REEL_UPLOAD.SHARE")}
                    </Button>
                </View>
            </View>
        </View>
    );
}

/** The picked video, looping; silent when another audio will replace its sound */
function VideoPreview({ uri, isMuted }: { uri: string; isMuted: boolean }) {
    const { colors } = useTheme();
    const player = useVideoPlayer(uri, (instance) => {
        instance.loop = true;
        instance.muted = true;
        instance.play();
    });

    useEffect(() => {
        setPlayerMuted(player, isMuted);
    }, [player, isMuted]);

    return (
        <View style={{ width: PREVIEW_WIDTH, aspectRatio: 9 / 16, borderRadius: radius.medium, overflow: "hidden", backgroundColor: colors.content3 }}>
            <VideoView player={player} style={{ flex: 1 }} contentFit="cover" nativeControls={false} />
        </View>
    );
}

function AudioOption({
    label,
    coverUrl,
    isSelected,
    isDisabled,
    onPress,
}: {
    label: string;
    coverUrl?: string;
    isSelected: boolean;
    isDisabled: boolean;
    onPress: () => void;
}) {
    const { colors } = useTheme();

    return (
        <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected, disabled: isDisabled }}
            disabled={isDisabled}
            onPress={onPress}
            style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: spacing[3],
                padding: spacing[2],
                borderRadius: radius.medium,
                backgroundColor: isSelected ? colors.content2 : pressed ? colors.content2 : "transparent",
            })}
        >
            <View
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: radius.small,
                    backgroundColor: colors.content3,
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                }}
            >
                {coverUrl ? (
                    <Image source={{ uri: coverUrl }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                ) : (
                    <Music2 size={18} color={colors.default500} />
                )}
            </View>
            <Text variant="small" numberOfLines={1} style={{ flex: 1 }}>
                {label}
            </Text>
            {isSelected ? <Check size={18} color={colors.foreground} /> : null}
        </Pressable>
    );
}
