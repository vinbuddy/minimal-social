import useAuthStore from "@/hooks/store/useAuthStore";
import useLoading from "@/hooks/useLoading";
import { getFileDimension } from "@/utils/mediaFile";
import {
    Avatar,
    Button,
    ButtonProps,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
    Slider,
    SliderValue,
    useDisclosure,
} from "@nextui-org/react";
import { CropIcon } from "lucide-react";
import { useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";
import AvatarCropper from "./AvatarCropper";

interface IProps {
    buttonProps: ButtonProps;
}

export default function EditProfileModalButton({ buttonProps }: IProps) {
    const { isOpen, onOpenChange, onOpen } = useDisclosure();

    const { currentUser } = useAuthStore();

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageURL, setImageURL] = useState<string | null>(null);
    const [isCropped, setIsCropped] = useState<boolean>(false);
    const cropRef = useRef<AvatarEditor | null>(null);
    const [slideValue, setSlideValue] = useState<SliderValue>(10);

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

    //handle save
    const handleSaveCroppedImage = async () => {
        if (cropRef.current) {
            const dataUrl = cropRef.current.getImage().toDataURL();
            const result = await fetch(dataUrl);
            const blob = await result.blob();
            setImageURL(URL.createObjectURL(blob));
            setIsCropped(false);
        }
    };

    return (
        <>
            <Button {...buttonProps} onClick={onOpen} />

            <Modal hideCloseButton size={isCropped ? "sm" : "lg"} isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalBody className="p-6">
                                {isCropped && (
                                    <AvatarCropper
                                        imageURL={imageURL}
                                        cropRef={cropRef}
                                        setImageURL={setImageURL}
                                        setIsCropped={setIsCropped}
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
                                                        base: "!size-32 !ring-offset-4 cursor-pointer",
                                                    }}
                                                    src={imageURL || currentUser?.photo}
                                                />
                                            </label>

                                            {imageURL && (
                                                <div className="mt-6 gap-4 flex justify-center">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => removeImage()}
                                                        color="danger"
                                                        radius="full"
                                                        variant="light"
                                                    >
                                                        Remove image
                                                    </Button>
                                                    <Button
                                                        startContent={<CropIcon strokeWidth={1.5} size={16} />}
                                                        size="sm"
                                                        color="default"
                                                        radius="full"
                                                        variant="flat"
                                                        onPress={() => setIsCropped(true)}
                                                    >
                                                        Crop image
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

                                        <div className="mt-6 flex flex-col gap-6">
                                            <div>
                                                <Input
                                                    type="text"
                                                    label="User name"
                                                    value={currentUser?.username}
                                                    fullWidth
                                                />
                                            </div>
                                            <div>
                                                <Input type="text" label="Bio" value={currentUser?.bio} fullWidth />
                                            </div>
                                            <Button fullWidth color="primary" radius="md" size="lg">
                                                Edit profile
                                            </Button>
                                        </div>
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
