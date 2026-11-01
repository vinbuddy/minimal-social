import { router } from "expo-router";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Logo, Text } from "@/components/ui";
import { spacing, useTheme } from "@/theme";

type AuthLayoutProps = {
    title: string;
    subtitle?: string;
    children: ReactNode;
    /** Below the form: "Don't have an account? Sign up" */
    footer?: ReactNode;
};

/** The web's auth column: centred, 350px wide, `display` title over a `default500` subtitle */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
    const { colors } = useTheme();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: spacing[4], paddingVertical: spacing[12] }}
                >
                    <View style={{ width: "100%", maxWidth: 350, alignSelf: "center", gap: spacing[6] }}>
                        <View style={{ alignItems: "center", gap: spacing[2] }}>
                            <Logo size={48} />
                            <Text variant="display" accessibilityRole="header" style={{ marginTop: spacing[4], textAlign: "center" }}>
                                {title}
                            </Text>
                            {subtitle ? (
                                <Text color="default500" style={{ textAlign: "center" }}>
                                    {subtitle}
                                </Text>
                            ) : null}
                        </View>
                        {children}
                        {footer ? <View style={{ alignItems: "center" }}>{footer}</View> : null}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

/** "Already have an account? Sign in": a sentence with an underlined, tappable tail */
export function AuthFooter({ text, linkLabel, onPress }: { text?: string; linkLabel: string; onPress: () => void }) {
    return (
        <Text variant="small" style={{ textAlign: "center" }}>
            {text ? `${text} ` : null}
            <Text variant="small" weight={600} style={{ textDecorationLine: "underline" }} onPress={onPress} accessibilityRole="link">
                {linkLabel}
            </Text>
        </Text>
    );
}

/** An OTP or reset screen opened without its pending request, e.g. after the app restarted mid-flow */
export function SessionLost() {
    const { t } = useTranslation("auth");

    return (
        <AuthLayout title={t("OTP_TITLE")} subtitle={t("ERROR_SESSION_LOST")}>
            <Button fullWidth size="lg" onPress={() => router.dismissTo("/login")}>
                {t("BACK_TO_SIGN_IN")}
            </Button>
        </AuthLayout>
    );
}

/** The server's error, shown above the submit button like the web's `root.server` error */
export function FormError({ message }: { message?: string | null }) {
    if (!message) return null;

    return (
        <Text variant="small" color="danger" style={{ textAlign: "center" }} accessibilityRole="alert">
            {message}
        </Text>
    );
}
