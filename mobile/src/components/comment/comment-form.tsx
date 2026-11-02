import { ArrowUp, X } from "lucide-react-native";
import { ComponentRef, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, Pressable, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MentionSuggestions } from "@/components/mention-suggestions";
import { Avatar, Button, Divider, Text, toast } from "@/components/ui";
import { useMentionInput } from "@/hooks/use-mention-input";
import { adjustCommentCount, commentWebUrl } from "@/lib/comment-target";
import { invalidate } from "@/lib/invalidate";
import { getErrorMessage } from "@/services/auth";
import { commentsUrl, createComment, repliesUrl } from "@/services/comments";
import { notify } from "@/services/notifications";
import useAuthStore from "@/stores/auth-store";
import { fontFamily, radius, spacing, typography, useTheme } from "@/theme";
import { CommentTarget, IComment } from "@/types/comment";

type CommentFormProps = {
    target: CommentTarget;
    replyTo: IComment | null;
    onCancelReply: () => void;
    autoFocus?: boolean;
};

/** Pinned under a post's or reel's comments, with a "Replying to" banner and @mention suggestions */
export function CommentForm({ target, replyTo, onCancelReply, autoFocus = false }: CommentFormProps) {
    const { t } = useTranslation(["comment", "app"]);
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const currentUser = useAuthStore((state) => state.currentUser);
    const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
    const [isSending, setIsSending] = useState(false);
    const mention = useMentionInput();

    // Tapping "Reply" focuses the field
    useEffect(() => {
        if (replyTo) inputRef.current?.focus();
    }, [replyTo]);

    const canSend = mention.text.trim().length > 0 && !isSending;

    const send = async () => {
        if (!canSend) return;
        setIsSending(true);
        try {
            const comment = await createComment({ target, content: mention.toHtml(), replyTo });
            mention.reset();
            // Sent: put the keyboard away so the new comment is in view
            inputRef.current?.blur();
            Keyboard.dismiss();
            onCancelReply();

            adjustCommentCount(target, 1);
            // The new comment, and the reply count on its thread
            invalidate(commentsUrl(target));
            if (comment.rootComment) invalidate(repliesUrl(comment.rootComment));

            if (replyTo) {
                notify(currentUser, {
                    target: comment._id,
                    targetType: "Comment",
                    action: "comment",
                    message: t("COMMENT_MESSAGE.REPLIED_TO_YOUR_COMMENT"),
                    receivers: [replyTo.commentBy._id],
                    url: commentWebUrl(target, comment._id, comment.rootComment),
                });
            } else {
                notify(currentUser, {
                    target: comment._id,
                    targetType: "Comment",
                    action: "comment",
                    message: t(target.type === "Post" ? "COMMENT_MESSAGE.COMMENTED_ON_YOUR_POST" : "COMMENT_MESSAGE.COMMENTED_ON_YOUR_REEL"),
                    receivers: [target.ownerId],
                    url: commentWebUrl(target, comment._id),
                });
            }
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setIsSending(false);
        }
    };

    return (
        <View style={{ backgroundColor: colors.background, paddingBottom: insets.bottom }}>
            <MentionSuggestions
                users={mention.suggestions}
                onPick={(user) => {
                    mention.pickSuggestion(user);
                    // Tapping a suggestion takes focus away from the field
                    inputRef.current?.focus();
                }}
            />
            <Divider />
            {replyTo ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[2], paddingHorizontal: spacing[4], paddingTop: spacing[2] }}>
                    <Text variant="tiny" color="default500" style={{ flex: 1 }} numberOfLines={1}>
                        {t("app:REPLYING_TO", { username: `@${replyTo.commentBy.username}` })}
                    </Text>
                    <Pressable accessibilityRole="button" accessibilityLabel="Cancel reply" hitSlop={10} onPress={onCancelReply}>
                        <X size={14} color={colors.default500} />
                    </Pressable>
                </View>
            ) : null}
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: spacing[3], paddingHorizontal: spacing[4], paddingVertical: spacing[2] }}>
                <Avatar size="sm" src={currentUser?.photo} name={currentUser?.username} />
                <TextInput
                    ref={inputRef}
                    {...mention.inputProps}
                    autoFocus={autoFocus}
                    multiline
                    maxLength={2000}
                    placeholder={t("COMMENT_PLACEHOLDER")}
                    placeholderTextColor={colors.default500}
                    style={{
                        flex: 1,
                        maxHeight: 120,
                        minHeight: 36,
                        paddingHorizontal: spacing[3],
                        paddingTop: spacing[2],
                        paddingBottom: spacing[2],
                        borderRadius: radius.bubble,
                        backgroundColor: colors.content2,
                        color: colors.foreground,
                        fontFamily: fontFamily[400],
                        fontSize: typography.small.fontSize,
                    }}
                />
                <Button isIconOnly size="sm" radius="full" isLoading={isSending} isDisabled={!canSend} accessibilityLabel="Send" onPress={send} style={{ marginBottom: 2 }}>
                    <ArrowUp size={16} color={colors.primaryForeground} />
                </Button>
            </View>
        </View>
    );
}
