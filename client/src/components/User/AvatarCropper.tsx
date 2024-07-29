import { Button, Slider, SliderValue } from "@nextui-org/react";
import { useState } from "react";
import AvatarEditor from "react-avatar-editor";
interface IProps {
    imageURL: string | null;
    cropRef: React.RefObject<AvatarEditor>;
    setImageURL: React.Dispatch<React.SetStateAction<string | null>>;
    setIsCropped: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AvatarCropper({ imageURL, cropRef, setImageURL, setIsCropped }: IProps) {
    const [slideValue, setSlideValue] = useState<SliderValue>(10);

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
                <Button onPress={() => setIsCropped(false)} fullWidth color="default" variant="light">
                    Cancel
                </Button>
                <Button onPress={handleSaveCroppedImage} fullWidth color="primary">
                    Save
                </Button>
            </div>
        </div>
    );
}
