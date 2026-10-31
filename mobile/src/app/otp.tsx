import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { AuthFooter, AuthLayout, FormError, OTP_LENGTH, OtpInput, SessionLost } from "@/components/auth";
import { Button, Text, toast } from "@/components/ui";
import { getErrorMessage, register, requestPasswordReset, verifyPasswordResetOTP, verifyRegisterOTP } from "@/services/auth";
import useAuthStore from "@/stores/auth-store";
import { spacing } from "@/theme";

/** Matches the server's OTP rate limit closely enough that "Resend" isn't offered just to be refused */
const RESEND_COOLDOWN_SECONDS = 60;

export default function OtpScreen() {
    const { t } = useTranslation("auth");
    const { type } = useLocalSearchParams<{ type: "register" | "forgot" }>();
    const pendingRegistration = useAuthStore((state) => state.pendingRegistration);
    const pendingPasswordReset = useAuthStore((state) => state.pendingPasswordReset);
    const setPendingRegistration = useAuthStore((state) => state.setPendingRegistration);
    const setPendingPasswordReset = useAuthStore((state) => state.setPendingPasswordReset);

    const [otp, setOtp] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    const email = type === "register" ? pendingRegistration?.email : pendingPasswordReset?.email;

    // Opened without a pending request (the app restarted mid-flow, or the flow just finished): nothing to verify
    if (!email) return <SessionLost />;

    const handleVerify = async () => {
        setError(null);
        setIsVerifying(true);
        try {
            if (type === "register") {
                await verifyRegisterOTP(email, otp);
                setPendingRegistration(null);
                toast.success(t("TOAST_REGISTERED"));
                router.dismissTo("/login");
            } else {
                await verifyPasswordResetOTP(email, otp);
                // The reset call consumes the same OTP, so it travels with the email
                setPendingPasswordReset({ email, otp });
                router.replace("/reset");
            }
        } catch (verifyError) {
            setError(getErrorMessage(verifyError));
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        setError(null);
        setIsResending(true);
        try {
            if (type === "register" && pendingRegistration) {
                await register(pendingRegistration);
            } else {
                await requestPasswordReset(email);
            }
            setOtp("");
            setCooldown(RESEND_COOLDOWN_SECONDS);
            toast.success(t("TOAST_OTP_SENT"));
        } catch (resendError) {
            setError(getErrorMessage(resendError));
        } finally {
            setIsResending(false);
        }
    };

    return (
        <AuthLayout
            title={t("OTP_TITLE")}
            subtitle={t("OTP_SUBTITLE", { email })}
            footer={<AuthFooter linkLabel={t("BACK_TO_SIGN_IN")} onPress={() => router.dismissTo("/login")} />}
        >
            <View style={{ gap: spacing[4] }}>
                <OtpInput
                    value={otp}
                    onChange={(value) => {
                        setOtp(value);
                        setError(null);
                    }}
                    isInvalid={!!error}
                />

                <FormError message={error} />

                <Button fullWidth size="lg" isLoading={isVerifying} isDisabled={otp.length < OTP_LENGTH} onPress={handleVerify}>
                    {t("VERIFY")}
                </Button>

                {cooldown > 0 ? (
                    <Text variant="small" color="default500" style={{ textAlign: "center" }}>
                        {t("RESEND_IN", { seconds: cooldown })}
                    </Text>
                ) : (
                    <Button variant="light" color="default" isLoading={isResending} onPress={handleResend} style={{ alignSelf: "center" }}>
                        {t("RESEND_CODE")}
                    </Button>
                )}
            </View>
        </AuthLayout>
    );
}
