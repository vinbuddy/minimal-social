import { Avatar, Button, ButtonProps, Input, Modal, ModalBody, ModalContent, useDisclosure } from "@heroui/react";
import { CropIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

import AvatarCropper from "./avatar-cropper";

import { getFileDimension } from "@/utils/media-file";
import { showToast } from "@/utils/toast";
import { IUser } from "@/types/user";
import { useAuthStore } from "@/hooks/store";
import { useGlobalMutation, useLoading } from "@/hooks";
import { ENV } from "@/config/env";
import { useTranslation } from "react-i18next";

interface IProps extends ButtonProps {}

interface IUserEditProfile {
    username: string;
    bio: string;
}

export default function EditProfileModalButton({ ...rest }: IProps) {
    const { isOpen, onOpenChange, onOpen, onClose } = useDisclosure();
    const { startLoading, stopLoading, loading } = useLoading();

    const { currentUser } = useAuthStore();
    const mutate = useGlobalMutation();
    const { t: tUser } = useTranslation("user");

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageURL, setImageURL] = useState<string | null>(null);
    const [isCropped, setIsCropped] = useState<boolean>(false);

    const {
        register,
        handleSubmit,
        watch,
        setError,
        formState: { errors },
    } = useForm<IUserEditProfile>();

    const handlePreviewAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target?.files) return;

        const file = e.target.files[0];

        if (file) {
            setImageFile(file);
            setImageURL(URL.createObjectURL(file));

            const dimension: any = await getFileDimension(file);
        }
    };

    const removeImage = (): void => {
        if (imageFile && imageURL) {
            URL.revokeObjectURL(imageURL);
            setImageFile(null);
            setImageURL(null);
        }
    };

    const handleOpenChange = (_open: boolean) => {
        // true if is loading
        if (loading) {
            return;
        }

        if (imageFile && imageURL) {
            removeImage();
        }

        setIsCropped(false);

        onOpenChange();
    };

    const handleEditProfile = async (data: IUserEditProfile, e?: React.BaseSyntheticEvent) => {
        e?.preventDefault();
        if (!currentUser) return;

        const formData = new FormData();

        let isValid = false;

        if (imageURL) {
            const response = await fetch(imageURL);
            const blob = await response.blob();

            formData.append("file", blob);
            isValid = true;
        }

        // Check if the user has changed the username or bio
        if (data.username.trim() !== currentUser?.username.trim()) {
            formData.append("username", data.username);
            isValid = true;
        }

        if (data.bio.trim() !== currentUser?.bio.trim()) {
            formData.append("bio", data.bio);
            isValid = true;
        }

        if (!isValid) {
            return setError("root.manual", {
                type: "manual",
                message: tUser("USER.EDIT.REQUIRE_CHANGE"),
            });
        }

        try {
            startLoading();

            const res = await axios.put(`${ENV.API_BASE_URL}/user/edit`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
            });

            if (res.status === 200) {
                onClose();

                mutate((key) => typeof key === "string" && key.includes("/user"));

                useAuthStore.setState((state) => ({
                    currentUser: {
                        ...(state.currentUser as IUser),
                        username: res.data.data.username,
                        bio: res.data.data.bio,
                        photo: res.data.data.photo,
                    },
                }));

                showToast(tUser("USER.EDIT.PROFILE_UPDATED"), "success");
            }
        } catch (error) {
            showToast("An error occurred while editing your profile", "error");
        } finally {
            stopLoading();
        }
    };

    return (
        <>
            <Button type="button" {...rest} onPress={onOpen}>
                {rest.children}
            </Button>

            <Modal hideCloseButton size={isCropped ? "sm" : "lg"} isOpen={isOpen} onOpenChange={handleOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalBody className="p-6">
                                {isCropped && (
                                    <AvatarCropper
                                        imageURL={imageURL}
                                        onSave={(url) => {
                                            setImageURL(url);
                                            setIsCropped(false);
                                        }}
                                        onCancel={() => setIsCropped(false)}
                                    />
                                )}

                                {!isCropped && (
                                    <div>
                                        <div className="flex flex-col items-center justify-center">
                                            <label htmlFor="avatar">
                                                <Avatar
                                                    isBordered
                                                    size="lg"
                                                    classNames={{
                                                        base: "!size-32 !ring-offset-4 cursor-pointer hover:opacity-85 transition",
                                                    }}
                                                    src={imageURL || currentUser?.photo}
                                                />
                                            </label>

                                            {imageURL && (
                                                <div className="mt-6 gap-4 flex justify-center">
                                                    <Button
                                                        size="sm"
                                                        onPress={() => removeImage()}
                                                        color="danger"
                                                        radius="full"
                                                        variant="light"
                                                    >
                                                        {tUser("USER.REMOVE_IMAGE")}
                                                    </Button>
                                                    <Button
                                                        startContent={<CropIcon strokeWidth={1.5} size={16} />}
                                                        size="sm"
                                                        color="default"
                                                        radius="full"
                                                        variant="flat"
                                                        onPress={() => setIsCropped(true)}
                                                    >
                                                        {tUser("USER.CROP_IMAGE")}
                                                    </Button>
                                                </div>
                                            )}

                                            <input
                                                onChange={handlePreviewAvatar}
                                                hidden
                                                type="file"
                                                name=""
                                                id="avatar"
                                                accept="image/png, image/jpeg"
                                            />
                                        </div>

                                        <form
                                            onSubmit={handleSubmit(handleEditProfile)}
                                            className="mt-6 flex flex-col gap-6"
                                        >
                                            <div>
                                                <Input
                                                    type="text"
                                                    label={tUser("USER.USERNAME")}
                                                    defaultValue={currentUser?.username}
                                                    fullWidth
                                                    {...register("username", {
                                                        required: true,
                                                        maxLength: 50,
                                                    })}
                                                />
                                            </div>
                                            <div>
                                                <Input
                                                    type="text"
                                                    label={tUser("USER.BIO")}
                                                    defaultValue={currentUser?.bio}
                                                    fullWidth
                                                    {...register("bio", {
                                                        required: false,
                                                        maxLength: 150,
                                                    })}
                                                />
                                            </div>

                                            {errors.root?.manual && (
                                                <p className="text-red-500 text-tiny my-2 text-center">
                                                    {errors.root?.manual?.message}
                                                </p>
                                            )}

                                            <Button
                                                isLoading={loading}
                                                type="submit"
                                                fullWidth
                                                color="primary"
                                                radius="md"
                                                size="lg"
                                            >
                                                {tUser("USER.EDIT_PROFILE")}
                                            </Button>
                                        </form>
                                    </div>
                                )}
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
