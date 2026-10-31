import { router } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { AuthFooter, AuthLayout, FormError, FormInput } from "@/components/auth";
import { Button, toast } from "@/components/ui";
import { EMAIL_PATTERN } from "@/lib/validation";
import { getErrorMessage, requestPasswordReset } from "@/services/auth";
import useAuthStore from "@/stores/auth-store";
import { spacing } from "@/theme";

export default function ForgotPasswordScreen() {
    const { t } = useTranslation("auth");
    const setPendingPasswordReset = useAuthStore((state) => state.setPendingPasswordReset);
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        formState: { isSubmitting },
    } = useForm<{ email: string }>({ defaultValues: { email: "" } });

    const onSubmit = handleSubmit(async ({ email }) => {
        setServerError(null);
        try {
            await requestPasswordReset(email.trim());
            setPendingPasswordReset({ email: email.trim() });
            toast.success(t("TOAST_OTP_SENT"));
            router.push({ pathname: "/otp", params: { type: "forgot" } });
        } catch (error) {
            setServerError(getErrorMessage(error));
        }
    });

    return (
        <AuthLayout
            title={t("FORGOT_PASSWORD_TITLE")}
            subtitle={t("FORGOT_PASSWORD_SUBTITLE")}
            footer={<AuthFooter linkLabel={t("BACK_TO_SIGN_IN")} onPress={() => router.back()} />}
        >
            <View style={{ gap: spacing[4] }}>
                <FormInput
                    control={control}
                    name="email"
                    label={t("EMAIL")}
                    placeholder="m@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="emailAddress"
                    returnKeyType="send"
                    onSubmitEditing={() => onSubmit()}
                    rules={{
                        required: t("ERROR_EMAIL_REQUIRED"),
                        pattern: { value: EMAIL_PATTERN, message: t("ERROR_EMAIL_INVALID") },
                    }}
                />

                <FormError message={serverError} />

                <Button fullWidth size="lg" isLoading={isSubmitting} onPress={() => onSubmit()}>
                    {t("SEND_CODE")}
                </Button>
            </View>
        </AuthLayout>
    );
}
