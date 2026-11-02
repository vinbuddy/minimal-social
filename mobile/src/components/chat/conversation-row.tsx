import { router } from "expo-router";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { Avatar, Badge, Text, UserName } from "@/components/ui";
import { richTextToPlain } from "@/lib/rich-text";
import { formatShortTime } from "@/lib/time";
import { spacing, useTheme } from "@/theme";
import { IConversation } from "@/types/chat";

/** The other person, the last message ("You: …" when it was yours) and its time; unread ones in ink with a count */
export const ConversationRow = memo(function ConversationRow({ conversation, currentUserId }: { conversation: IConversation; currentUserId: string }) {
    const { t, i18n } = useTranslation("app");
    const { colors } = useTheme();
    const other = conversation.participants.find((participant) => participant._id !== currentUserId) ?? conversation.participants[0];
    const unread = conversation.unreadCount ?? 0;
    const last = conversation.lastMessage;
    const preview = last ? `${String(last.sender) === currentUserId ? t("CHAT_YOU_PREFIX") : ""}${richTextToPlain(last.content)}` : t("CHAT_START");

    return (
        <Pressable
            accessibilityRole="button"
            onPress={() =>
                router.push({
                    pathname: "/conversations/[id]",
                    params: { id: conversation._id },
                })
            }
            style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: spacing[3],
                paddingHorizontal: spacing[4],
                paddingVertical: spacing[3],
                backgroundColor: pressed ? colors.content2 : "transparent",
            })}
        >
            <Avatar size="lg" src={other?.photo} name={other?.username} />
            <View style={{ flex: 1, gap: spacing[1] }}>
                <UserName username={other?.username} isVerified={other?.isVerified} />
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: spacing[1],
                    }}
                >
                    <Text
                        variant="small"
                        numberOfLines={1}
                        weight={unread > 0 ? 600 : 400}
                        color={unread > 0 ? "foreground" : "default600"}
                        style={{ flexShrink: 1 }}
                    >
                        {preview}
                    </Text>
                    {last ? (
                        <Text variant="small" color="default500">
                            · {formatShortTime(last.createdAt, i18n.language)}
                        </Text>
                    ) : null}
                </View>
            </View>
            <Badge count={unread} />
        </Pressable>
    );
});
