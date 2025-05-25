import { Button, Slider, SliderValue } from "@heroui/react";
import { useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";
import { useTranslation } from "react-i18next";
interface IProps {
    imageURL: string | null;
    onSave: (url: string) => void;
    onCancel: () => void;
}

export default function AvatarCropper({ imageURL, onSave, onCancel }: IProps) {
    const [slideValue, setSlideValue] = useState<SliderValue>(10);
    const cropRef = useRef<AvatarEditor | null>(null);
    const { t } = useTranslation("common");

    const handleSaveCroppedImage = async () => {
        if (cropRef.current) {
            const dataUrl = cropRef.current.getImage().toDataURL();
            const result = await fetch(dataUrl);
            const blob = await result.blob();

            onSave(URL.createObjectURL(blob));
        }
    };

    return (
        <div className="flex flex-col items-center">
            <div className="rounded-xl mt-3 overflow-hidden h-[300px] w-[300px]">
                {imageURL && (
                    <AvatarEditor
                        backgroundColor="#fff"
                        ref={cropRef}
                        image={imageURL}
                        style={{ width: "100%", height: "100%" }}
                        border={50}
                        borderRadius={150}
                        color={[0, 0, 0, 0.72]}
                        scale={(slideValue as number) / 10}
                        rotate={0}
                    />
                )}
            </div>
            <div className="mt-5 w-full">
                <Slider
                    label="Zoom"
                    minValue={10}
                    maxValue={50}
                    size="sm"
                    value={slideValue}
                    onChange={setSlideValue}
                />
            </div>

            <div className="flex w-full mt-5 gap-4">
                <Button onPress={onCancel} fullWidth color="default" variant="light">
                    {t("CANCEL")}
                </Button>
                <Button onPress={handleSaveCroppedImage} fullWidth color="primary">
                    {t("SAVE")}
                </Button>
            </div>
        </div>
    );
}
