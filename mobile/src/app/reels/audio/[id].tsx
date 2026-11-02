import { useEventListener } from "expo";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useVideoPlayer } from "expo-video";
import { Music2, Pause, Play } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useSWR from "swr";

import { ReelGrid } from "@/components/reel/reel-grid";
import { ScreenHeader } from "@/components/screen-header";
import { Button, Skeleton, Text, toast } from "@/components/ui";
import { fetcher } from "@/lib/http";
import { invalidate } from "@/lib/invalidate";
import { getErrorMessage } from "@/services/auth";
import { audioReelsUrl, audioUrl, saveAudio, savedAudiosUrl, unsaveAudio } from "@/services/reels";
import { radius, spacing, useTheme } from "@/theme";
import { IReelAudio } from "@/types/reel";

/** A sound: who it's from, how many reels use it, play it, save it, make a reel with it, and those reels */
export default function AudioScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { t } = useTranslation("reel");
    const { colors } = useTheme();
    const { data, error, isLoading, mutate } = useSWR<{ data: IReelAudio }>(audioUrl(id), fetcher);
    const audio = data?.data;

    return (
        <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
            <ScreenHeader title={t("AUDIO.TITLE")} />
            {isLoading ? (
                <View style={{ flexDirection: "row", gap: spacing[4], padding: spacing[4] }}>
                    <Skeleton width={96} height={96} radius="medium" />
                    <View style={{ flex: 1, gap: spacing[2] }}>
                        <Skeleton width="60%" height={18} />
                        <Skeleton width="40%" height={14} />
                    </View>
                </View>
            ) : !audio ? (
                <Text color="default500" style={{ textAlign: "center", padding: spacing[12] }}>
                    {error ? t("AUDIO.NOT_FOUND") : null}
                </Text>
            ) : (
                <ReelGrid
                    url={audioReelsUrl(audio._id)}
                    header={<AudioHeader audio={audio} onSavedChange={(isSaved) => mutate({ data: { ...audio, isSaved } }, { revalidate: false })} />}
                    empty={
                        <Text variant="small" color="default500" style={{ textAlign: "center", padding: spacing[6] }}>
                            {t("REEL_EMPTY")}
                        </Text>
                    }
                />
            )}
        </SafeAreaView>
    );
}

function AudioHeader({ audio, onSavedChange }: { audio: IReelAudio; onSavedChange: (isSaved: boolean) => void }) {
    const { t } = useTranslation("reel");
    const { colors } = useTheme();
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    // expo-video plays the MP3 too; no separate audio module needed
    const player = useVideoPlayer(audio.url, (instance) => {
        instance.loop = true;
    });
    useEventListener(player, "playingChange", ({ isPlaying: playing }) => setIsPlaying(playing));

    const toggleSaved = async () => {
        const next = !audio.isSaved;
        setIsSaving(true);
        try {
            await (next ? saveAudio(audio._id) : unsaveAudio(audio._id));
            onSavedChange(next);
            toast.success(t(next ? "AUDIO.SAVED" : "AUDIO.UNSAVED"));
            invalidate(savedAudiosUrl);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={{ padding: spacing[4], gap: spacing[4] }}>
            <View style={{ flexDirection: "row", gap: spacing[4], alignItems: "center" }}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t(isPlaying ? "REEL_PAUSE" : "REEL_PLAY")}
                    onPress={() => (isPlaying ? player.pause() : player.play())}
                    style={{ width: 96, height: 96, borderRadius: radius.medium, overflow: "hidden", backgroundColor: colors.content3 }}
                >
                    {audio.coverUrl ? (
                        <Image source={{ uri: audio.coverUrl }} style={{ flex: 1 }} contentFit="cover" />
                    ) : (
                        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                            <Music2 size={32} color={colors.default500} />
                        </View>
                    )}
                    <View style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0, 0, 0, 0.25)" }}>
                        {isPlaying ? <Pause size={28} color="#ffffff" fill="#ffffff" /> : <Play size={28} color="#ffffff" fill="#ffffff" />}
                    </View>
                </Pressable>

                <View style={{ flex: 1, gap: spacing[1] }}>
                    <Text variant="heading" numberOfLines={2}>
                        {audio.title ?? t("AUDIO.ORIGINAL")}
                    </Text>
                    <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: "/profile/[id]", params: { id: audio.owner._id } })}>
                        <Text variant="small" weight={600}>
                            {audio.owner.username}
                        </Text>
                    </Pressable>
                    <Text variant="small" color="default500">
                        {t("REEL_COUNT", { count: audio.reelCount })}
                    </Text>
                </View>
            </View>

            <View style={{ flexDirection: "row", gap: spacing[2] }}>
                <Button variant="bordered" color="default" size="sm" style={{ flex: 1 }} isLoading={isSaving} onPress={toggleSaved}>
                    {audio.isSaved ? t("AUDIO.SAVED") : t("AUDIO.SAVE")}
                </Button>
                <Button size="sm" style={{ flex: 1 }} onPress={() => router.push({ pathname: "/reels/create", params: { audioId: audio._id } })}>
                    {t("AUDIO.USE")}
                </Button>
            </View>
        </View>
    );
}
