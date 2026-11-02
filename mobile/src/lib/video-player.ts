import { VideoPlayer } from "expo-video";

// A VideoPlayer is a native object driven imperatively; these keep the writes out of components, where the React
// Compiler's lint reads a hook's return value as immutable

export function setPlayerMuted(player: VideoPlayer, isMuted: boolean) {
    player.muted = isMuted;
}

export function pauseAndRewind(player: VideoPlayer) {
    player.pause();
    player.currentTime = 0;
}
