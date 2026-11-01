import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FormError, FormInput, OTP_LENGTH, OtpInput } from "@/components/auth";
import { GoogleIcon, VerifiedIcon } from "@/components/icons";
import { ScreenHeader } from "@/components/screen-header";
import { Avatar, Button, Divider, Text, toast, UserName } from "@/components/ui";
import { saveTokens } from "@/lib/token-storage";
import { PASSWORD_MAX, PASSWORD_MIN } from "@/lib/validation";
import { getErrorMessage } from "@/services/auth";
import { confirmPasswordChange, requestPasswordChange } from "@/services/users";
import useAuthStore from "@/stores/auth-store";
import { radius, spacing, useTheme } from "@/theme";

type PasswordForm = { password: string; newPassword: string; confirm: string };

/** Who you're signed in as, and changing the password (current + new, then the emailed OTP), as on the web */
export default function AccountScreen() {
    const { t } = useTranslation(["user", "auth", "app"]);
    const { colors } = useTheme();
    const currentUser = useAuthStore((state) => state.currentUser);
    const [step, setStep] = useState<"form" | "otp">("form");
    const [otp, setOtp] = useState("");
    const [serverError, setServerError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);

    const {
        control,
        handleSubmit,
        getValues,
        reset,
        formState: { isSubmitting },
    } = useForm<PasswordForm>({ defaultValues: { password: "", newPassword: "", confirm: "" } });

    const sendCode = handleSubmit(async ({ password, newPassword }) => {
        setServerError(null);
        try {
            await requestPasswordChange(password, newPassword);
            toast.success(t("auth:TOAST_OTP_SENT"));
            setStep("otp");
        } catch (error) {
            setServerError(getErrorMessage(error));
        }
    });

    const verify = async () => {
        setServerError(null);
        setIsVerifying(true);
        try {
            // Every other device is signed out; these tokens keep this one signed in
            const tokens = await confirmPasswordChange(otp);
            if (tokens) await saveTokens(tokens);
            toast.success(t("app:PASSWORD_CHANGED"));
            reset();
            setOtp("");
            setStep("form");
        } catch (error) {
            setServerError(getErrorMessage(error));
        } finally {
            setIsVerifying(false);
        }
    };

    const passwordRules = {
        required: t("auth:ERROR_PASSWORD_REQUIRED"),
        minLength: { value: PASSWORD_MIN, message: t("auth:ERROR_PASSWORD_MIN") },
        maxLength: { value: PASSWORD_MAX, message: t("auth:ERROR_PASSWORD_MAX") },
    };

    return (
        <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
            <ScreenHeader title={t("USER.SETTING.ACCOUNT")} />
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: spacing[12] }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[4], padding: spacing[4] }}>
                        <Avatar size="lg" src={currentUser?.photo} name={currentUser?.username} />
                        <View style={{ flex: 1, gap: spacing[1] }}>
                            <UserName username={currentUser?.username} isVerified={currentUser?.isVerified} />
                            <Text variant="small" color="default500" numberOfLines={1}>
                                {currentUser?.email}
                            </Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[2], paddingHorizontal: spacing[4], paddingBottom: spacing[4] }}>
                        {currentUser?.googleId ? <Chip icon={<GoogleIcon size={14} />} label={t("app:SIGNED_IN_WITH_GOOGLE")} /> : null}
                        {currentUser?.isVerified ? <Chip icon={<VerifiedIcon size={14} />} label={t("app:ACCOUNT_VERIFIED")} /> : null}
                    </View>
                    <Divider />

                    <View style={{ padding: spacing[4], gap: spacing[4] }}>
                        <Text variant="heading">{t("app:CHANGE_PASSWORD")}</Text>

                        {step === "form" ? (
                            <>
                                <FormInput
                                    control={control}
                                    name="password"
                                    label={t("app:CURRENT_PASSWORD")}
                                    isPassword
                                    autoComplete="current-password"
                                    textContentType="password"
                                    rules={{ required: t("auth:ERROR_PASSWORD_REQUIRED") }}
                                />
                                <FormInput
                                    control={control}
                                    name="newPassword"
                                    label={t("auth:NEW_PASSWORD")}
                                    isPassword
                                    autoComplete="new-password"
                                    textContentType="newPassword"
                                    rules={passwordRules}
                                />
                                <FormInput
                                    control={control}
                                    name="confirm"
                                    label={t("auth:CONFIRM_PASSWORD")}
                                    isPassword
                                    autoComplete="new-password"
                                    textContentType="newPassword"
                                    rules={{
                                        required: t("auth:ERROR_CONFIRM_REQUIRED"),
                                        validate: (value) => value === getValues("newPassword") || t("auth:ERROR_PASSWORD_MISMATCH"),
                                    }}
                                />
                                <FormError message={serverError} />
                                <Button fullWidth isLoading={isSubmitting} onPress={() => sendCode()}>
                                    {t("auth:SEND_CODE")}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Text variant="small" color="default500">
                                    {t("auth:OTP_SUBTITLE", { email: currentUser?.email })}
                                </Text>
                                <OtpInput value={otp} onChange={setOtp} isInvalid={!!serverError} />
                                <FormError message={serverError} />
                                <Button fullWidth isLoading={isVerifying} isDisabled={otp.length < OTP_LENGTH} onPress={verify}>
                                    {t("auth:VERIFY")}
                                </Button>
                                <Button variant="light" color="default" style={{ alignSelf: "center" }} onPress={() => setStep("form")}>
                                    {t("app:BACK")}
                                </Button>
                            </>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function Chip({ icon, label }: { icon: ReactNode; label: string }) {
    const { colors } = useTheme();

    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing[1.5],
                paddingHorizontal: spacing[3],
                paddingVertical: spacing[1],
                borderRadius: radius.full,
                backgroundColor: colors.content2,
            }}
        >
            {icon}
            <Text variant="tiny" weight={500}>
                {label}
            </Text>
        </View>
    );
}
