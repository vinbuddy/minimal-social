import { create } from "zustand";

interface VideoTimeState {
    currentTimeSec: number;
    durationSec: number;
    currentTime: [number, number];
    duration: [number, number];
}

interface VideoState {
    url: string;
    time: VideoTimeState;
    muted?: boolean;
    isFullscreen: boolean;
}

interface useVideoState {
    videos: VideoState[];
    setVideoTime: (url: string, muted: boolean, time: VideoTimeState) => void;
    getVideo: (url: string) => VideoState | undefined;
    turnOffFullscreenVideo: (url: string) => void;
}

const useVideoStore = create<useVideoState>((set) => ({
    videos: [],
    setVideoTime: (
        url: string,
        muted: boolean,

        time: VideoTimeState
    ): void => {
        const video = useVideoStore.getState().videos.find((video) => video.url === url);

        if (video) {
            // exists -> update time
            set((state) => ({
                videos: state.videos.map((video) =>
                    video.url === url ? { ...video, time, muted, isFullscreen: true } : video
                ),
            }));
        } else {
            // Push to state
            set((state) => ({
                videos: [
                    ...state.videos,
                    {
                        url,
                        time,
                        muted,
                        isFullscreen: true,
                    },
                ],
            }));
        }
    },
    getVideo: (url: string): VideoState | undefined => {
        return useVideoStore.getState().videos.find((video) => video.url === url);
    },
    turnOffFullscreenVideo: (url: string) => {
        set((state) => ({
            videos: state.videos.map((video) => (video.url === url ? { ...video, isFullscreen: false } : video)),
        }));
    },
}));

export default useVideoStore;
