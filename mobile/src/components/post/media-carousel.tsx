import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import { Play } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, useWindowDimensions, View } from "react-native";

import { radius, spacing, useTheme } from "@/theme";
import { IMediaFile, IPost } from "@/types/post";
import { MediaGallery } from "./media-gallery";
import { PostActions } from "./post-actions";

/** A single item fills the column, between portrait 4:5 and landscape 1.91:1 (Instagram's bounds) */
const SINGLE_MIN_ASPECT = 4 / 5;
const SINGLE_MAX_ASPECT = 1.91;
/** Several items share one height and keep their own shape, like Threads */
const STRIP_HEIGHT = 240;
const STRIP_MIN_ASPECT = 9 / 16;
const STRIP_MAX_ASPECT = 4 / 3;

/** Media sits on its own ground; a faint edge keeps white photos from melting into the page */
const borderHairline = 0.5;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const aspectOf = (file: IMediaFile) => (file.width && file.height ? file.width / file.height : 1);

type MediaCarouselProps = {
    post: IPost;
    /**
     * How far the strip may extend past the content column, to the screen edges: Threads scrolls media from the
     * text's left edge out to the right edge of the screen.
     */
    bleed?: { start: number; end: number };
};

/** A post's photos and videos; tapping one opens the fullscreen gallery */
export function MediaCarousel({ post, bleed = { start: 0, end: 0 } }: MediaCarouselProps) {
    const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
    const [columnWidth, setColumnWidth] = useState(0);
    const { width: screenWidth } = useWindowDimensions();
    // Wide items stop short of the screen edge so the next one always peeks in
    const maxTileWidth = screenWidth - bleed.start - spacing[12];
    const files = post.mediaFiles;

    if (files.length === 0) return null;

    const closeGallery = () => setGalleryIndex(null);
    const gallery = (
        <MediaGallery
            mediaFiles={files}
            initialIndex={galleryIndex}
            onClose={closeGallery}
            footer={<PostActions post={post} onMedia onBeforeNavigate={closeGallery} />}
        />
    );

    if (files.length === 1) {
        const aspect = clamp(aspectOf(files[0]), SINGLE_MIN_ASPECT, SINGLE_MAX_ASPECT);
        return (
            <View onLayout={(event) => setColumnWidth(event.nativeEvent.layout.width)}>
                {columnWidth > 0 ? (
                    <MediaTile file={files[0]} width={columnWidth} height={columnWidth / aspect} onPress={() => setGalleryIndex(0)} />
                ) : (
                    <View style={{ aspectRatio: aspect }} />
                )}
                {gallery}
            </View>
        );
    }

    return (
        <View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                style={{ marginStart: -bleed.start, marginEnd: -bleed.end }}
                contentContainerStyle={{ gap: spacing[2], paddingStart: bleed.start, paddingEnd: bleed.end }}
            >
                {files.map((file, index) => {
                    const width = Math.min(STRIP_HEIGHT * clamp(aspectOf(file), STRIP_MIN_ASPECT, STRIP_MAX_ASPECT), maxTileWidth);
                    return (
                        <MediaTile
                            key={file.publicId ?? `${file.url}-${index}`}
                            file={file}
                            width={width}
                            height={STRIP_HEIGHT}
                            onPress={() => setGalleryIndex(index)}
                            accessibilityLabel={`${index + 1}/${files.length}`}
                        />
                    );
                })}
            </ScrollView>
            {gallery}
        </View>
    );
}

type MediaTileProps = { file: IMediaFile; width: number; height: number; onPress: () => void; accessibilityLabel?: string };

function MediaTile({ file, width, height, onPress, accessibilityLabel }: MediaTileProps) {
    const { colors } = useTheme();

    return (
        <Pressable
            accessibilityRole="imagebutton"
            accessibilityLabel={accessibilityLabel}
            onPress={onPress}
            style={({ pressed }) => ({
                width,
                height,
                borderRadius: radius.large,
                overflow: "hidden",
                backgroundColor: colors.content3,
                borderWidth: borderHairline,
                borderColor: colors.divider,
                opacity: pressed ? 0.9 : 1,
            })}
        >
            {file.type === "video" ? (
                <VideoPreview uri={file.url} />
            ) : (
                <Image source={{ uri: file.url }} style={{ flex: 1 }} contentFit="cover" transition={150} recyclingKey={file.url} />
            )}
        </Pressable>
    );
}

/** First frame with a play badge; the video plays in the gallery */
function VideoPreview({ uri }: { uri: string }) {
    const player = useVideoPlayer(uri, (instance) => {
        instance.muted = true;
    });

    return (
        <View style={{ flex: 1, backgroundColor: "#000000" }}>
            <View pointerEvents="none" style={{ flex: 1 }}>
                <VideoView player={player} style={{ flex: 1 }} contentFit="cover" nativeControls={false} />
            </View>
            <View pointerEvents="none" style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" }}>
                <View style={{ width: 44, height: 44, borderRadius: radius.full, backgroundColor: "rgba(0, 0, 0, 0.5)", alignItems: "center", justifyContent: "center" }}>
                    <Play size={20} color="#ffffff" fill="#ffffff" />
                </View>
            </View>
        </View>
    );
}
