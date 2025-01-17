import { Button, ButtonProps } from "@heroui/react";
import { forwardRef } from "react";

interface IProps extends ButtonProps {
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function MediaFileUploader({ onUpload, ...rest }: IProps, ref: React.ForwardedRef<HTMLInputElement>) {
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

            <Button {...rest}>{rest.children}</Button>
        </>
    );
}

export default forwardRef(MediaFileUploader);
