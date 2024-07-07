import { Button, ButtonProps, InternalForwardRefRenderFunction } from "@nextui-org/react";
import { forwardRef } from "react";
// import { TbPhoto } from "react-icons/tb";

interface IProps {
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    buttonProps: ButtonProps;
}

function MediaFileUploader({ onUpload, buttonProps }: IProps, ref: React.ForwardedRef<HTMLInputElement>) {
    return (
        <>
            <input
                ref={ref}
                type="file"
                name="media-file"
                id="file-input"
                hidden
                multiple
                onChange={onUpload}
                accept="image/jpeg,image/png,video/mp4,video/quicktime"
            />

            <Button {...buttonProps} />
        </>
    );
}

export default forwardRef(MediaFileUploader);
