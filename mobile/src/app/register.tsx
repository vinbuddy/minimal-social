import { router } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { AuthFooter, AuthLayout, FormError, FormInput } from "@/components/auth";
import { Button, toast } from "@/components/ui";
import { EMAIL_PATTERN, PASSWORD_MAX, PASSWORD_MIN, USERNAME_MAX } from "@/lib/validation";
import { getErrorMessage, register } from "@/services/auth";
import useAuthStore from "@/stores/auth-store";
import { spacing } from "@/theme";

type RegisterForm = { username: string; email: string; password: string; confirm: string };

export default function RegisterScreen() {
    const { t } = useTranslation("auth");
    const setPendingRegistration = useAuthStore((state) => state.setPendingRegistration);
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        getValues,
        formState: { isSubmitting },
    } = useForm<RegisterForm>({ defaultValues: { username: "", email: "", password: "", confirm: "" } });

    const onSubmit = handleSubmit(async ({ username, email, password }) => {
        setServerError(null);
        const input = { username: username.trim(), email: email.trim(), password };

        try {
            await register(input);
            // Kept for "Resend code", which has to send the whole registration again
            setPendingRegistration(input);
            toast.success(t("TOAST_OTP_SENT"));
            router.push({ pathname: "/otp", params: { type: "register" } });
        } catch (error) {
            setServerError(getErrorMessage(error));
        }
    });

    const passwordRules = {
        required: t("ERROR_PASSWORD_REQUIRED"),
        minLength: { value: PASSWORD_MIN, message: t("ERROR_PASSWORD_MIN") },
        maxLength: { value: PASSWORD_MAX, message: t("ERROR_PASSWORD_MAX") },
    };

    return (
        <AuthLayout
            title={t("SIGN_UP")}
            subtitle={t("SIGN_UP_SUBTITLE")}
            footer={<AuthFooter text={t("HAVE_ACCOUNT")} linkLabel={t("SIGN_IN")} onPress={() => router.back()} />}
        >
            <View style={{ gap: spacing[4] }}>
                <FormInput
                    control={control}
                    name="username"
                    label={t("USERNAME")}
                    placeholder="John Doe"
                    autoComplete="username"
                    textContentType="username"
                    rules={{
                        required: t("ERROR_USERNAME_REQUIRED"),
                        maxLength: { value: USERNAME_MAX, message: t("ERROR_USERNAME_TOO_LONG") },
                    }}
                />
                <FormInput
                    control={control}
                    name="email"
                    label={t("EMAIL")}
                    placeholder="m@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="emailAddress"
                    rules={{
                        required: t("ERROR_EMAIL_REQUIRED"),
                        pattern: { value: EMAIL_PATTERN, message: t("ERROR_EMAIL_INVALID") },
                    }}
                />
                <FormInput
                    control={control}
                    name="password"
                    label={t("PASSWORD")}
                    isPassword
                    autoComplete="new-password"
                    textContentType="newPassword"
                    rules={passwordRules}
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
                    {t("CREATE_ACCOUNT")}
                </Button>
            </View>
        </AuthLayout>
    );
}
