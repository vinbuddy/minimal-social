import { Image } from "expo-image";
import { Play } from "lucide-react-native";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { RichText } from "@/components/rich-text";
import { Avatar, Text } from "@/components/ui";
import { gifImageUrl, GROUP_GAP_MS, isEmojiOnly, isSameDay, messagePreview } from "@/lib/chat-format";
import { radius, spacing, typography, useTheme } from "@/theme";
import { IMessage, ITheme } from "@/types/chat";
import { IUser } from "@/types/user";

const AVATAR = 28;
/** Corners where two bubbles of a group meet */
const JOIN_RADIUS = 4;

type MessageItemProps = {
    message: IMessage;
    /** Neighbours in time, to group consecutive messages and place date chips */
    older?: IMessage;
    newer?: IMessage;
    currentUserId: string;
    theme: ITheme | null;
    /** The other person, named in reply quotes */
    otherName: string;
    /** People shown as "seen" under this message (the latest of yours they've seen) */
    seenBy: IUser[];
    isHighlighted: boolean;
    onLongPress: (message: IMessage) => void;
    onOpenMedia: (message: IMessage, index: number) => void;
    onReactionsPress: (message: IMessage) => void;
};

const sameGroup = (a?: IMessage, b?: IMessage) =>
    !!a && !!b && a.sender._id === b.sender._id && Math.abs(new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) <= GROUP_GAP_MS;

/**
 * One message: own bubbles right in ink (or the conversation's theme colour), others left on `content2` with the
 * avatar on the group's last bubble; reply quote above, reactions below, a date chip at each new day.
 */
export const MessageItem = memo(function MessageItem(props: MessageItemProps) {
    const { message, older, newer, currentUserId, theme, otherName, seenBy, isHighlighted, onLongPress, onOpenMedia, onReactionsPress } = props;
    const { t, i18n } = useTranslation("app");
    const { colors } = useTheme();

    const isMine = message.sender._id === currentUserId;
    // A reply starts its own group, with its quote above
    const isFirst = !sameGroup(older, message) || !!message.replyTo;
    const isLast = !sameGroup(message, newer) || !!newer?.replyTo;
    const showDate = !older || !isSameDay(older.createdAt, message.createdAt);

    const bubbleColor = isMine ? (theme?.color ?? colors.primary) : colors.content2;
    // A theme colour always takes white text, as on the web
    const inkColor = isMine ? (theme ? "#ffffff" : colors.primaryForeground) : colors.foreground;

    const corner = (outer: boolean) => (outer ? radius.bubble : JOIN_RADIUS);
    const bubbleRadius = isMine
        ? {
              borderTopLeftRadius: radius.bubble,
              borderBottomLeftRadius: radius.bubble,
              borderTopRightRadius: corner(isFirst),
              borderBottomRightRadius: corner(isLast),
          }
        : {
              borderTopRightRadius: radius.bubble,
              borderBottomRightRadius: radius.bubble,
              borderTopLeftRadius: corner(isFirst),
              borderBottomLeftRadius: corner(isLast),
          };

    const previewLabels = {
        photo: t("CHAT_PHOTO"),
        sticker: t("CHAT_STICKER"),
        gif: "GIF",
        retracted: t("CHAT_RETRACTED"),
    };
    const replyTarget = message.replyTo?.sender === currentUserId ? t("CHAT_YOU") : otherName;

    const reactionSummary = [...new Set(message.reactions.map((reaction) => reaction.emoji))].slice(0, 3);

    return (
        <View
            style={{
                paddingHorizontal: spacing[3],
                marginTop: isFirst ? spacing[2] : 2,
            }}
        >
            {showDate ? (
                <Text variant="tiny" color="default500" style={{ textAlign: "center", marginVertical: spacing[3] }}>
                    {new Date(message.createdAt).toLocaleString(i18n.language, {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </Text>
            ) : null}

            {message.replyTo ? (
                <View
                    style={{
                        alignItems: isMine ? "flex-end" : "flex-start",
                        marginStart: isMine ? 0 : AVATAR + spacing[2],
                        marginBottom: -spacing[2],
                    }}
                >
                    <Text variant="tiny" color="default500" style={{ marginBottom: 2 }}>
                        {t("CHAT_REPLIED_TO", { name: replyTarget })}
                    </Text>
                    <View
                        style={{
                            maxWidth: "75%",
                            paddingHorizontal: spacing[3],
                            paddingTop: spacing[2],
                            paddingBottom: spacing[3],
                            borderRadius: radius.bubble,
                            backgroundColor: isMine ? colors.content2 : colors.content3,
                            opacity: 0.8,
                        }}
                    >
                        <Text variant="small" color="default600" numberOfLines={2}>
                            {messagePreview(message.replyTo, previewLabels)}
                        </Text>
                    </View>
                </View>
            ) : null}

            <View
                style={{
                    flexDirection: "row",
                    alignItems: "flex-end",
                    justifyContent: isMine ? "flex-end" : "flex-start",
                    gap: spacing[2],
                }}
            >
                {!isMine ? (
                    <View style={{ width: AVATAR }}>{isLast ? <Avatar size="xs" src={message.sender.photo} name={message.sender.username} /> : null}</View>
                ) : null}

                {/* Not a button itself: it holds media and reaction buttons. Screen readers get the menu as an action */}
                <Pressable
                    accessibilityHint={t("CHAT_MESSAGE_HINT")}
                    accessibilityActions={[{ name: "longpress", label: t("CHAT_MESSAGE_HINT") }]}
                    onAccessibilityAction={() => onLongPress(message)}
                    onLongPress={() => onLongPress(message)}
                    delayLongPress={300}
                    style={{
                        maxWidth: "75%",
                        alignItems: isMine ? "flex-end" : "flex-start",
                        gap: 2,
                    }}
                >
                    <MessageBody
                        message={message}
                        isMine={isMine}
                        bubbleColor={bubbleColor}
                        inkColor={inkColor}
                        bubbleRadius={bubbleRadius}
                        isHighlighted={isHighlighted}
                        onOpenMedia={onOpenMedia}
                    />

                    {reactionSummary.length > 0 ? (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={t("CHAT_REACTIONS", {
                                count: message.reactions.length,
                            })}
                            onPress={() => onReactionsPress(message)}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 2,
                                marginTop: -spacing[2],
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                borderRadius: radius.full,
                                backgroundColor: colors.content1,
                                borderWidth: 1,
                                borderColor: colors.divider,
                            }}
                        >
                            <Text variant="tiny">{reactionSummary.join("")}</Text>
                            {message.reactions.length > 1 ? (
                                <Text variant="tiny" color="default600">
                                    {message.reactions.length}
                                </Text>
                            ) : null}
                        </Pressable>
                    ) : null}
                </Pressable>
            </View>

            {seenBy.length > 0 ? (
                <View
                    accessibilityLabel={t("CHAT_SEEN")}
                    style={{
                        flexDirection: "row",
                        justifyContent: "flex-end",
                        gap: 2,
                        marginTop: 4,
                    }}
                >
                    {seenBy.map((user) => (
                        <View key={user._id} style={{ transform: [{ scale: 0.6 }], margin: -4 }}>
                            <Avatar size="xs" src={user.photo} name={user.username} />
                        </View>
                    ))}
                </View>
            ) : null}
        </View>
    );
});

type MessageBodyProps = {
    message: IMessage;
    isMine: boolean;
    bubbleColor: string;
    inkColor: string;
    bubbleRadius: object;
    isHighlighted: boolean;
    onOpenMedia: (message: IMessage, index: number) => void;
};

function MessageBody({ message, isMine, bubbleColor, inkColor, bubbleRadius, isHighlighted, onOpenMedia }: MessageBodyProps) {
    const { t } = useTranslation("app");
    const { colors } = useTheme();
    const highlight = isHighlighted ? { borderWidth: 3, borderColor: colors.default400 } : null;

    if (message.isRetracted) {
        return (
            <View
                style={[
                    {
                        paddingHorizontal: spacing[3],
                        paddingVertical: spacing[2],
                        borderWidth: 1,
                        borderColor: colors.default300,
                        borderRadius: radius.bubble,
                    },
                    highlight,
                ]}
            >
                <Text variant="message" color="default500" style={{ fontStyle: "italic" }}>
                    {t("CHAT_RETRACTED")}
                </Text>
            </View>
        );
    }

    return (
        <View style={[{ gap: 4, alignItems: isMine ? "flex-end" : "flex-start" }, highlight, isHighlighted ? { borderRadius: radius.bubble } : null]}>
            {message.mediaFiles.length > 0 ? <MessageMedia message={message} isMine={isMine} onOpen={onOpenMedia} /> : null}
            {message.stickerUrl ? (
                <Image source={{ uri: message.stickerUrl }} style={{ width: 100, height: 100 }} contentFit="contain" accessibilityLabel={t("CHAT_STICKER")} />
            ) : null}
            {message.gifUrl ? (
                <Image
                    source={{ uri: gifImageUrl(message.gifUrl) }}
                    style={{ width: 200, height: 200, borderRadius: radius.large }}
                    contentFit="cover"
                    accessibilityLabel="GIF"
                />
            ) : null}
            {message.content ? (
                isEmojiOnly(message.content) ? (
                    <RichText
                        html={message.content}
                        variant="emoji"
                        style={{
                            fontSize: typography.emoji.fontSize + 8,
                            lineHeight: typography.emoji.lineHeight + 8,
                        }}
                    />
                ) : (
                    <View
                        style={[
                            {
                                paddingHorizontal: spacing[3],
                                paddingVertical: spacing[2],
                                backgroundColor: bubbleColor,
                            },
                            bubbleRadius,
                        ]}
                    >
                        <RichText html={message.content} variant="message" style={{ color: inkColor }} linkColor={isMine ? inkColor : undefined} />
                    </View>
                )
            ) : null}
        </View>
    );
}

/** Cloudinary serves a video's first frame at the same path with an image extension */
const posterOf = (url: string) => (url.includes("/video/upload/") ? url.replace(/\.\w+(\?.*)?$/, ".jpg") : null);

function MessageMedia({ message, isMine, onOpen }: { message: IMessage; isMine: boolean; onOpen: (message: IMessage, index: number) => void }) {
    const { t } = useTranslation("app");
    const { colors } = useTheme();
    const files = message.mediaFiles;
    const single = files.length === 1;

    return (
        <View
            style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 4,
                justifyContent: isMine ? "flex-end" : "flex-start",
                maxWidth: 224,
            }}
        >
            {files.map((file, index) => {
                const aspect = file.width && file.height ? Math.min(1.6, Math.max(0.6, file.width / file.height)) : 1;
                const image = file.type === "video" ? posterOf(file.url) : file.url;
                const size = single ? { width: 220, height: 220 / aspect } : { width: 110, height: 110 };
                return (
                    <Pressable
                        key={file.publicId ?? `${file.url}-${index}`}
                        accessibilityRole="imagebutton"
                        accessibilityLabel={file.type === "video" ? t("CHAT_VIDEO") : t("CHAT_PHOTO")}
                        onPress={() => onOpen(message, index)}
                    >
                        <Image
                            source={image ? { uri: image } : null}
                            style={{
                                ...size,
                                borderRadius: radius.large,
                                backgroundColor: file.type === "video" ? "#000000" : colors.content3,
                            }}
                            contentFit="cover"
                            transition={150}
                        />
                        {file.type === "video" ? (
                            <View
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Play size={24} color="#ffffff" fill="#ffffff" />
                            </View>
                        ) : null}
                    </Pressable>
                );
            })}
        </View>
    );
}
