import { useEvent, useEventListener } from "expo";
import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import { Play } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Animated, Easing, Pressable, View } from "react-native";

import { HeartIcon } from "@/components/icons";
import { useAnimatedValue } from "@/hooks/use-animated-value";
import { pauseAndRewind, setPlayerMuted } from "@/lib/video-player";
import { useReelStore } from "@/stores/reel-store";
import { radius } from "@/theme";
import { IReel } from "@/types/reel";

const DOUBLE_TAP_MS = 250;

type ReelPlayerProps = {
    reel: IReel;
    /** On screen: plays (unless paused); off screen it pauses and rewinds */
    isActive: boolean;
    /** Near the active reel: the player is created so it's buffered before you swipe to it */
    isNear: boolean;
    isPaused: boolean;
    onTogglePause: () => void;
    onDoubleTap: () => void;
};

/**
 * A reel's video, filling its page: thumbnail until the first frame plays, tap to pause, double tap to like (with a
 * heart), a thin progress line at the bottom. Far-off reels show only the thumbnail.
 */
export function ReelPlayer(props: ReelPlayerProps) {
    const { reel, isNear } = props;
    const fit = videoFit(reel);

    return (
        <View style={{ flex: 1, backgroundColor: "#000000" }}>
            {/* Off-ratio videos sit over a blurred copy of their first frame, as on the web */}
            {fit === "contain" ? (
                <Image source={{ uri: reel.video.thumbnailUrl }} style={{ position: "absolute", inset: 0, opacity: 0.6 }} contentFit="cover" blurRadius={30} />
            ) : null}
            {isNear ? (
                <ActivePlayer {...props} fit={fit} />
            ) : (
                <Image source={{ uri: reel.video.thumbnailUrl }} style={{ flex: 1 }} contentFit={fit} recyclingKey={reel._id} />
            )}
        </View>
    );
}

/** Close to 9:16 fills the screen; anything wider or taller is shown whole */
function videoFit(reel: IReel): "cover" | "contain" {
    const ratio = reel.video.width / reel.video.height;
    return ratio >= 0.5 && ratio <= 0.65 ? "cover" : "contain";
}

function ActivePlayer({ reel, isActive, isPaused, onTogglePause, onDoubleTap, fit }: ReelPlayerProps & { fit: "cover" | "contain" }) {
    const { t } = useTranslation("reel");
    const isMuted = useReelStore((state) => state.isMuted);
    const [hasStarted, setHasStarted] = useState(false);
    const lastTap = useRef(0);
    const singleTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const heart = useAnimatedValue(0);

    const player = useVideoPlayer(reel.video.url, (instance) => {
        instance.loop = true;
        instance.muted = useReelStore.getState().isMuted;
        instance.timeUpdateEventInterval = 0.25;
    });

    const { status } = useEvent(player, "statusChange", { status: player.status });
    const { currentTime } = useEvent(player, "timeUpdate", { currentTime: 0, currentLiveTimestamp: null, currentOffsetFromLive: null, bufferedPosition: 0 });
    // The thumbnail covers the black frames before playback starts
    useEventListener(player, "playingChange", ({ isPlaying }) => {
        if (isPlaying) setHasStarted(true);
    });

    useEffect(() => {
        setPlayerMuted(player, isMuted);
    }, [player, isMuted]);

    useEffect(() => {
        if (isActive && !isPaused) player.play();
        else if (isPaused) player.pause();
        // Swiped away: start over next time, as the web does
        else pauseAndRewind(player);
    }, [player, isActive, isPaused]);

    useEffect(
        () => () => {
            if (singleTapTimer.current) clearTimeout(singleTapTimer.current);
        },
        [],
    );

    const onPress = () => {
        const now = Date.now();
        if (now - lastTap.current < DOUBLE_TAP_MS) {
            if (singleTapTimer.current) clearTimeout(singleTapTimer.current);
            lastTap.current = 0;
            onDoubleTap();
            heart.setValue(0);
            Animated.sequence([
                Animated.timing(heart, { toValue: 1, duration: 180, easing: Easing.out(Easing.back(2)), useNativeDriver: true }),
                Animated.delay(400),
                Animated.timing(heart, { toValue: 2, duration: 200, useNativeDriver: true }),
            ]).start();
            return;
        }
        lastTap.current = now;
        singleTapTimer.current = setTimeout(onTogglePause, DOUBLE_TAP_MS);
    };

    const duration = player.duration || reel.video.duration;
    const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0;

    return (
        <Pressable accessibilityRole="button" accessibilityLabel={t(isPaused ? "REEL_PLAY" : "REEL_PAUSE")} onPress={onPress} style={{ flex: 1 }}>
            <View pointerEvents="none" style={{ flex: 1 }}>
                <VideoView player={player} style={{ flex: 1 }} contentFit={fit} nativeControls={false} onFirstFrameRender={() => setHasStarted(true)} />
                {!hasStarted ? (
                    <Image source={{ uri: reel.video.thumbnailUrl }} style={{ position: "absolute", inset: 0 }} contentFit={fit} recyclingKey={reel._id} />
                ) : null}
            </View>

            {isActive && status === "loading" ? (
                <View pointerEvents="none" style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" }}>
                    <ActivityIndicator color="#ffffff" />
                </View>
            ) : null}

            {isPaused ? (
                <View pointerEvents="none" style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" }}>
                    <View
                        style={{
                            width: 64,
                            height: 64,
                            borderRadius: radius.full,
                            backgroundColor: "rgba(0, 0, 0, 0.45)",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Play size={28} color="#ffffff" fill="#ffffff" />
                    </View>
                </View>
            ) : null}

            <Animated.View
                pointerEvents="none"
                style={{
                    position: "absolute",
                    inset: 0,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: heart.interpolate({ inputRange: [0, 0.2, 1, 2], outputRange: [0, 1, 1, 0] }),
                    transform: [{ scale: heart.interpolate({ inputRange: [0, 1, 2], outputRange: [0.4, 1, 1.3] }) }],
                }}
            >
                <HeartIcon size={96} filled color="#ffffff" />
            </Animated.View>

            <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 2, backgroundColor: "rgba(255, 255, 255, 0.25)" }}>
                <View style={{ width: `${progress * 100}%`, height: "100%", backgroundColor: "#ffffff" }} />
            </View>
        </Pressable>
    );
}
