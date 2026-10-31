import { router } from "expo-router";
import { ComponentRef, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TextInput, View } from "react-native";

import { AuthFooter, AuthLayout, FormError, FormInput, GoogleButton } from "@/components/auth";
import { Button, Divider, Text, toast } from "@/components/ui";
import { isGoogleSignInAvailable } from "@/lib/google-sign-in";
import { EMAIL_PATTERN } from "@/lib/validation";
import { getErrorMessage, login } from "@/services/auth";
import useAuthStore from "@/stores/auth-store";
import { spacing } from "@/theme";

type LoginForm = { email: string; password: string };

export default function LoginScreen() {
    const { t } = useTranslation("auth");
    const signIn = useAuthStore((state) => state.signIn);
    const [serverError, setServerError] = useState<string | null>(null);
    const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);

    const {
        control,
        handleSubmit,
        formState: { isSubmitting },
    } = useForm<LoginForm>({ defaultValues: { email: "", password: "" } });

    const onSubmit = handleSubmit(async ({ email, password }) => {
        setServerError(null);
        try {
            const { data, tokens } = await login(email.trim(), password);
            await signIn(data, tokens);
            toast.success(t("TOAST_SIGNED_IN"));
        } catch (error) {
            setServerError(getErrorMessage(error));
        }
    });

    return (
        <AuthLayout
            title={t("SIGN_IN")}
            subtitle={t("SIGN_IN_SUBTITLE")}
            footer={<AuthFooter text={t("NO_ACCOUNT")} linkLabel={t("SIGN_UP")} onPress={() => router.push("/register")} />}
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
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    rules={{
                        required: t("ERROR_EMAIL_REQUIRED"),
                        pattern: { value: EMAIL_PATTERN, message: t("ERROR_EMAIL_INVALID") },
                    }}
                />
                <View style={{ gap: spacing[1.5] }}>
                    <FormInput
                        control={control}
                        name="password"
                        ref={passwordRef}
                        label={t("PASSWORD")}
                        isPassword
                        autoComplete="current-password"
                        textContentType="password"
                        returnKeyType="go"
                        onSubmitEditing={() => onSubmit()}
                        // Only required: older accounts may have passwords shorter than today's sign-up minimum
                        rules={{ required: t("ERROR_PASSWORD_REQUIRED") }}
                    />
                    <Text
                        variant="small"
                        style={{ alignSelf: "flex-end", textDecorationLine: "underline" }}
                        onPress={() => router.push("/forgot")}
                        accessibilityRole="link"
                    >
                        {t("FORGOT_PASSWORD")}
                    </Text>
                </View>

                <FormError message={serverError} />

                <Button fullWidth size="lg" isLoading={isSubmitting} onPress={() => onSubmit()}>
                    {t("SIGN_IN")}
                </Button>
                <OrDivider label={t("OR")} />
                <GoogleButton isDisabled={isSubmitting} />
            </View>
        </AuthLayout>
    );
}

function OrDivider({ label }: { label: string }) {
    if (!isGoogleSignInAvailable) return null;

    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[3] }}>
            <Divider style={{ flex: 1, width: undefined }} />
            <Text variant="tiny" color="default500">
                {label}
            </Text>
            <Divider style={{ flex: 1, width: undefined }} />
        </View>
    );
}
