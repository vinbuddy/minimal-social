import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FormInput } from "@/components/auth";
import { Avatar, Button, Divider, Text, toast } from "@/components/ui";
import { invalidate } from "@/lib/invalidate";
import { goBack } from "@/lib/navigation";
import { USERNAME_MAX } from "@/lib/validation";
import { getErrorMessage } from "@/services/auth";
import { editProfile, ProfilePhoto, userUrl } from "@/services/users";
import useAuthStore from "@/stores/auth-store";
import { spacing, useTheme } from "@/theme";

/** The web's bio limit */
const BIO_MAX = 150;

type ProfileForm = { username: string; bio: string };

/** Edit profile, as a sheet: photo (cropped square by the system picker), username, bio */
export default function EditProfileScreen() {
    const { t } = useTranslation(["user", "app", "common", "auth"]);
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const currentUser = useAuthStore((state) => state.currentUser);
    const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
    const [photo, setPhoto] = useState<ProfilePhoto | null>(null);

    const {
        control,
        handleSubmit,
        formState: { isSubmitting },
    } = useForm<ProfileForm>({ defaultValues: { username: currentUser?.username ?? "", bio: currentUser?.bio ?? "" } });

    const pickPhoto = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
        if (result.canceled) return;

        const asset = result.assets[0];
        setPhoto({ uri: asset.uri, name: asset.fileName ?? `avatar-${Date.now()}.jpg`, mimeType: asset.mimeType ?? "image/jpeg" });
    };

    const save = handleSubmit(async ({ username, bio }) => {
        if (!currentUser) return;

        // Only what changed, like the web; the server refuses an edit that changes nothing
        const changes = {
            ...(username.trim() !== currentUser.username ? { username: username.trim() } : {}),
            ...(bio.trim() !== currentUser.bio ? { bio: bio.trim() } : {}),
            ...(photo ? { photo } : {}),
        };
        if (Object.keys(changes).length === 0) {
            toast.error(t("USER.EDIT.REQUIRE_CHANGE"));
            return;
        }

        try {
            const updated = await editProfile(changes);
            setCurrentUser({ ...currentUser, username: updated.username, bio: updated.bio, photo: updated.photo });
            invalidate(userUrl(currentUser._id));
            // Your name and photo appear on your posts
            invalidate("/post");
            toast.success(t("USER.EDIT.PROFILE_UPDATED"));
            goBack();
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    });

    return (
        <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === "ios" ? 0 : insets.top }}>
            <View style={{ flexDirection: "row", alignItems: "center", minHeight: 56, paddingHorizontal: spacing[4] }}>
                <Pressable accessibilityRole="button" hitSlop={10} onPress={() => goBack()} style={{ minWidth: 72 }}>
                    <Text>{t("common:CANCEL")}</Text>
                </Pressable>
                <Text variant="large" weight={600} accessibilityRole="header" style={{ flex: 1, textAlign: "center" }} numberOfLines={1}>
                    {t("USER.EDIT_PROFILE")}
                </Text>
                <View style={{ minWidth: 72, alignItems: "flex-end" }}>
                    <Button size="sm" radius="full" isLoading={isSubmitting} onPress={() => save()}>
                        {t("common:SAVE")}
                    </Button>
                </View>
            </View>
            <Divider />

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: spacing[4], gap: spacing[5], paddingBottom: insets.bottom + spacing[6] }}>
                    <View style={{ alignItems: "center", gap: spacing[3] }}>
                        <Pressable accessibilityRole="button" accessibilityLabel={t("app:CHANGE_PHOTO")} onPress={pickPhoto}>
                            <Avatar size="xl" src={photo?.uri ?? currentUser?.photo} name={currentUser?.username} isBordered />
                        </Pressable>
                        <Button size="sm" variant="light" color="default" onPress={pickPhoto}>
                            {t("app:CHANGE_PHOTO")}
                        </Button>
                    </View>

                    <FormInput
                        control={control}
                        name="username"
                        label={t("USER.USERNAME")}
                        autoCapitalize="none"
                        autoCorrect={false}
                        maxLength={USERNAME_MAX}
                        rules={{
                            validate: (value) => value.trim().length > 0 || t("auth:ERROR_USERNAME_REQUIRED"),
                            maxLength: { value: USERNAME_MAX, message: t("auth:ERROR_USERNAME_TOO_LONG") },
                        }}
                    />
                    <FormInput
                        control={control}
                        name="bio"
                        label={t("USER.BIO")}
                        multiline
                        maxLength={BIO_MAX}
                        style={{ minHeight: 72, textAlignVertical: "top" }}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
