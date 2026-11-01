import { router } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { AuthFooter, AuthLayout, FormError, FormInput, SessionLost } from "@/components/auth";
import { Button, toast } from "@/components/ui";
import { PASSWORD_MAX, PASSWORD_MIN } from "@/lib/validation";
import { getErrorMessage, resetPassword } from "@/services/auth";
import useAuthStore from "@/stores/auth-store";
import { spacing } from "@/theme";

type ResetForm = { password: string; confirm: string };

export default function ResetPasswordScreen() {
    const { t } = useTranslation("auth");
    const pending = useAuthStore((state) => state.pendingPasswordReset);
    const setPendingPasswordReset = useAuthStore((state) => state.setPendingPasswordReset);
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        getValues,
        formState: { isSubmitting },
    } = useForm<ResetForm>({ defaultValues: { password: "", confirm: "" } });

    // Only reachable after the OTP screen verified a code
    if (!pending?.otp) return <SessionLost />;
    const { email, otp } = pending;

    const onSubmit = handleSubmit(async ({ password }) => {
        setServerError(null);
        try {
            await resetPassword({ email, otp, password });
            setPendingPasswordReset(null);
            toast.success(t("TOAST_PASSWORD_RESET"));
            router.dismissTo("/login");
        } catch (error) {
            setServerError(getErrorMessage(error));
        }
    });

    return (
        <AuthLayout
            title={t("RESET_PASSWORD_TITLE")}
            subtitle={t("RESET_PASSWORD_SUBTITLE", { email })}
            footer={<AuthFooter linkLabel={t("BACK_TO_SIGN_IN")} onPress={() => router.dismissTo("/login")} />}
        >
            <View style={{ gap: spacing[4] }}>
                <FormInput
                    control={control}
                    name="password"
                    label={t("NEW_PASSWORD")}
                    isPassword
                    autoComplete="new-password"
                    textContentType="newPassword"
                    rules={{
                        required: t("ERROR_PASSWORD_REQUIRED"),
                        minLength: { value: PASSWORD_MIN, message: t("ERROR_PASSWORD_MIN") },
                        maxLength: { value: PASSWORD_MAX, message: t("ERROR_PASSWORD_MAX") },
                    }}
                />
                <FormInput
                    control={control}
                    name="confirm"
                    label={t("CONFIRM_PASSWORD")}
                    isPassword
                    autoComplete="new-password"
                    textContentType="newPassword"
                    rules={{
                        required: t("ERROR_CONFIRM_REQUIRED"),
                        validate: (value) => value === getValues("password") || t("ERROR_PASSWORD_MISMATCH"),
                    }}
                />

                <FormError message={serverError} />

                <Button fullWidth size="lg" isLoading={isSubmitting} onPress={() => onSubmit()}>
                    {t("RESET_PASSWORD")}
                </Button>
            </View>
        </AuthLayout>
    );
}
