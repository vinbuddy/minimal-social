import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useVideoPlayer, VideoView } from "expo-video";
import { X } from "lucide-react-native";
import { ReactNode, useEffect, useState } from "react";
import { FlatList, Modal, NativeScrollEvent, NativeSyntheticEvent, Platform, Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui";
import { radius, spacing } from "@/theme";
import { IMediaFile } from "@/types/post";

type MediaGalleryProps = {
    mediaFiles: IMediaFile[];
    /** Index of the item tapped; null when closed */
    initialIndex: number | null;
    onClose: () => void;
    /** Shown at the bottom on the black ground, e.g. a post's actions */
    footer?: ReactNode;
};

/**
 * Threads' fullscreen viewer: black ground, round close button, swipe between items, an optional footer
 * (a post's actions) at the bottom. Photos pinch to zoom on iOS; videos play with native controls while on screen.
 */
export function MediaGallery({ mediaFiles, initialIndex, onClose, footer }: MediaGalleryProps) {
    return (
        <Modal
            visible={initialIndex !== null}
            animationType="fade"
            presentationStyle="overFullScreen"
            transparent
            statusBarTranslucent
            onRequestClose={onClose}
        >
            {/* Mounted per opening, so it starts on the item tapped */}
            {initialIndex !== null ? <GalleryContent mediaFiles={mediaFiles} initialIndex={initialIndex} onClose={onClose} footer={footer} /> : null}
        </Modal>
    );
}

function GalleryContent({ mediaFiles: files, initialIndex, onClose, footer }: Omit<MediaGalleryProps, "initialIndex"> & { initialIndex: number }) {
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const [index, setIndex] = useState(initialIndex);

    const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => setIndex(Math.round(event.nativeEvent.contentOffset.x / width));

    return (
        <View style={{ flex: 1, backgroundColor: "#000000" }}>
            <StatusBar style="light" />
            <FlatList
                data={files}
                keyExtractor={(file, i) => file.publicId ?? `${file.url}-${i}`}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                initialScrollIndex={initialIndex}
                getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
                onMomentumScrollEnd={onScroll}
                renderItem={({ item, index: itemIndex }) => (
                    <View style={{ width, height, justifyContent: "center" }}>
                        {item.type === "video" ? (
                            <GalleryVideo file={item} isActive={itemIndex === index} width={width} />
                        ) : (
                            <ZoomableImage file={item} width={width} height={height} />
                        )}
                    </View>
                )}
            />

            <View
                pointerEvents="box-none"
                style={{
                    position: "absolute",
                    top: insets.top + spacing[2],
                    left: spacing[4],
                    right: spacing[4],
                    flexDirection: "row",
                    alignItems: "center",
                }}
            >
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                    hitSlop={8}
                    onPress={onClose}
                    style={({ pressed }) => ({
                        width: 40,
                        height: 40,
                        borderRadius: radius.full,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: pressed ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.15)",
                    })}
                >
                    <X size={22} color="#ffffff" />
                </Pressable>
                <View style={{ flex: 1 }} />
                {files.length > 1 ? (
                    <View
                        style={{
                            paddingHorizontal: spacing[3],
                            paddingVertical: spacing[1],
                            borderRadius: radius.full,
                            backgroundColor: "rgba(255, 255, 255, 0.15)",
                        }}
                    >
                        <Text variant="small" weight={500} style={{ color: "#ffffff" }}>
                            {index + 1}/{files.length}
                        </Text>
                    </View>
                ) : null}
            </View>

            <View style={{ position: "absolute", left: 0, right: 0, bottom: insets.bottom + spacing[3], alignItems: "center" }}>
                {footer}
            </View>
        </View>
    );
}

/** iOS ScrollView zooms natively; Android shows the photo fitted */
function ZoomableImage({ file, width, height }: { file: IMediaFile; width: number; height: number }) {
    const image = <Image source={{ uri: file.url }} style={{ width, height }} contentFit="contain" transition={150} />;
    if (Platform.OS !== "ios") return image;

    return (
        <ScrollView
            maximumZoomScale={3}
            minimumZoomScale={1}
            centerContent
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
        >
            {image}
        </ScrollView>
    );
}

function GalleryVideo({ file, isActive, width }: { file: IMediaFile; isActive: boolean; width: number }) {
    const player = useVideoPlayer(file.url, (instance) => {
        instance.loop = true;
    });

    // Only the item on screen plays
    useEffect(() => {
        if (isActive) player.play();
        else player.pause();
    }, [isActive, player]);

    const aspect = file.width && file.height ? file.width / file.height : 9 / 16;
    return <VideoView player={player} style={{ width, height: width / aspect, maxHeight: "100%" }} contentFit="contain" nativeControls />;
}
