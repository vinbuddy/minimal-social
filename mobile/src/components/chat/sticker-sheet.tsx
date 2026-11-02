import { Image } from "expo-image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Modal, Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useSWR from "swr";

import { Divider, Text } from "@/components/ui";
import { fetcher } from "@/lib/http";
import { radius, spacing, useTheme } from "@/theme";
import { IStickerPack } from "@/types/chat";

const COLUMNS = 4;

/** The server's sticker packs: pack tabs over a grid; tapping a sticker sends it */
export function StickerSheet({ isOpen, onClose, onPick }: { isOpen: boolean; onClose: () => void; onPick: (url: string) => void }) {
    const { t } = useTranslation("app");
    const { colors, shadows } = useTheme();
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();
    // Fetched the first time the sheet opens
    const { data, isLoading } = useSWR<{ data: IStickerPack[] }>(isOpen ? "/sticker" : null, fetcher, { revalidateOnFocus: false });
    const packs = data?.data ?? [];
    const [packId, setPackId] = useState<string | null>(null);
    const pack = packs.find((candidate) => candidate._id === packId) ?? packs[0];
    const cell = (Math.min(width, 600) - spacing[4] * 2) / COLUMNS;

    return (
        <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable accessibilityLabel="Close" style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.4)" }} onPress={onClose} />
            <View
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: Math.min(420, height * 0.6),
                    paddingBottom: insets.bottom,
                    paddingTop: spacing[2],
                    borderTopLeftRadius: radius.large,
                    borderTopRightRadius: radius.large,
                    backgroundColor: colors.content1,
                    boxShadow: shadows.large,
                }}
            >
                <View
                    style={{
                        alignSelf: "center",
                        width: 36,
                        height: 4,
                        borderRadius: radius.full,
                        backgroundColor: colors.default300,
                        marginBottom: spacing[2],
                    }}
                />
                {isLoading ? (
                    <ActivityIndicator style={{ padding: spacing[6] }} color={colors.default500} />
                ) : !pack ? (
                    <Text variant="small" color="default500" style={{ textAlign: "center", padding: spacing[6] }}>
                        {t("CHAT_NO_STICKERS")}
                    </Text>
                ) : (
                    <>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={{ flexGrow: 0 }}
                            contentContainerStyle={{
                                gap: spacing[2],
                                paddingHorizontal: spacing[4],
                                paddingBottom: spacing[2],
                            }}
                        >
                            {packs.map((candidate) => (
                                <Pressable
                                    key={candidate._id}
                                    accessibilityRole="tab"
                                    accessibilityLabel={candidate.name}
                                    accessibilityState={{ selected: candidate._id === pack._id }}
                                    onPress={() => setPackId(candidate._id)}
                                    style={{
                                        padding: spacing[1],
                                        borderRadius: radius.medium,
                                        backgroundColor: candidate._id === pack._id ? colors.content2 : "transparent",
                                    }}
                                >
                                    <Image source={{ uri: candidate.thumbnail }} style={{ width: 32, height: 32 }} contentFit="contain" />
                                </Pressable>
                            ))}
                        </ScrollView>
                        <Divider />
                        <FlatList
                            key={pack._id}
                            data={pack.stickers}
                            numColumns={COLUMNS}
                            keyExtractor={(sticker) => sticker.url}
                            contentContainerStyle={{ padding: spacing[4] }}
                            renderItem={({ item }) => (
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel={item.tags[0] ?? t("CHAT_STICKER")}
                                    onPress={() => onPick(item.url)}
                                    style={({ pressed }) => ({
                                        width: cell,
                                        height: cell,
                                        padding: spacing[2],
                                        opacity: pressed ? 0.6 : 1,
                                    })}
                                >
                                    <Image source={{ uri: item.url }} style={{ flex: 1 }} contentFit="contain" />
                                </Pressable>
                            )}
                        />
                    </>
                )}
            </View>
        </Modal>
    );
}
