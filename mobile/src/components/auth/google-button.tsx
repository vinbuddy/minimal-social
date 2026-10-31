import { useState } from "react";
import { useTranslation } from "react-i18next";

import { GoogleIcon } from "@/components/icons";
import { Button, toast } from "@/components/ui";
import { isGoogleSignInAvailable, signInWithGoogle } from "@/lib/google-sign-in";
import { getErrorMessage, loginWithGoogle } from "@/services/auth";
import useAuthStore from "@/stores/auth-store";

/** Native Google Sign-In; renders nothing in Expo Go, on web, or without a configured client ID */
export function GoogleButton({ isDisabled = false }: { isDisabled?: boolean }) {
    const { t } = useTranslation("auth");
    const signIn = useAuthStore((state) => state.signIn);
    const [isLoading, setIsLoading] = useState(false);

    if (!isGoogleSignInAvailable) return null;

    const handlePress = async () => {
        setIsLoading(true);
        try {
            const idToken = await signInWithGoogle();
            if (!idToken) return; // Cancelled

            const { data, tokens } = await loginWithGoogle(idToken);
            await signIn(data, tokens);
            toast.success(t("TOAST_SIGNED_IN"));
        } catch (error) {
            toast.error(`${t("TOAST_GOOGLE_FAILED")}: ${getErrorMessage(error)}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            fullWidth
            size="lg"
            variant="bordered"
            color="default"
            isLoading={isLoading}
            isDisabled={isDisabled}
            startContent={<GoogleIcon size={20} />}
            onPress={handlePress}
        >
            {t("SIGN_IN_WITH_GOOGLE")}
        </Button>
    );
}
