"use client";
import { ImageIcon } from "@/assets/icons";
import { IConversation } from "@/types/conversation";
import { Button } from "@nextui-org/react";
import { SendHorizonalIcon, SmileIcon, StickerIcon, ThumbsUpIcon } from "lucide-react";
import RichTextEditor from "../RichTextEditor";
import { ChangeEvent, useRef, useState } from "react";
import EmojiPicker from "../EmojiPicker";
import MediaFileUploaderButton from "../Media/MediaFileUploaderButton";
import { IMediaFile } from "@/types/post";
import { checkLimitSize, getFileDimension, getFileFormat } from "@/utils/mediaFile";
import MediaFileSlider from "../Media/MediaFileSlider";

interface IProps {
    conversation?: IConversation;
}

export default function MessageForm({ conversation }: IProps) {
    const [message, setMessage] = useState<string>("");
    const [mediaFiles, setMediaFiles] = useState<IMediaFile[]>([]);

    const messageInputRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadMediaFiles = async (e: ChangeEvent<HTMLInputElement>) => {
        const files: any = e.target.files;

        if (!files) {
            return;
        }

        const fileInfos: IMediaFile[] = [];
        for (let i = 0; i < files?.length; i++) {
            const file = files.item(i);

            if (!checkLimitSize(file)) {
                alert("LIMIT");
                return;
            }

            const localURL = URL.createObjectURL(file);
            const dimension: any = await getFileDimension(file);

            fileInfos.push({
                url: localURL,
                file: file,
                width: dimension.width,
                height: dimension.height,
                type: getFileFormat(file.type),
            });
        }

        // Preview
        setMediaFiles((prev) => [...prev, ...fileInfos]);
    };

    const removeMediaFiles = (index: number) => {
        // Remove from FileList
        if (fileInputRef.current) {
            const newFileList = new DataTransfer();
            const updatedFileList = Array.from(fileInputRef.current.files!);

            updatedFileList.splice(index, 1);
            updatedFileList.forEach((file) => newFileList.items.add(file));

            fileInputRef.current.files = newFileList.files;
        }

        let removedFile: any;
        setMediaFiles((prev) => {
            removedFile = prev.splice(index, 1); // Remove from state

            return [...prev];
        });

        // Remove URL after set state mediaFiles
        if (removedFile?.url) URL.revokeObjectURL(removedFile.url);
    };

    return (
        <div className={`flex  gap-x-2 px-4 ${mediaFiles.length > 0 ? "items-end" : "items-center"}`}>
            <div>
                <MediaFileUploaderButton
                    buttonProps={{
                        disableRipple: true,
                        isIconOnly: true,
                        radius: "full",
                        color: "default",
                        variant: "light",
                        children: (
                            <>
                                <label
                                    htmlFor="file-input"
                                    className="w-full h-full flex items-center justify-center cursor-pointer"
                                >
                                    <ImageIcon size={20} className="text-default-600" />
                                </label>
                            </>
                        ),
                    }}
                    ref={fileInputRef}
                    onUpload={uploadMediaFiles}
                />
                <input type="file" name="media-file" id="media-file" hidden />
                <Button isIconOnly variant="light" radius="full">
                    <StickerIcon size={20} className="text-default-600" strokeWidth={1.5} />
                </Button>
            </div>

            <div className="flex-1 relative py-3 px-4 flex flex-col items-start bg-background border border-divider rounded-3xl overflow-x-hidden">
                {/* Media files */}
                {mediaFiles.length > 0 && (
                    <div className="max-w-full overflow-hidden [&_.swiper]:!h-[80px] mb-3">
                        <MediaFileSlider
                            scrollHorizontally
                            videoPreview={true}
                            mediaFiles={mediaFiles}
                            onRemoveMediaFile={removeMediaFiles}
                        />
                    </div>
                )}

                <div className="flex flex-1 w-full">
                    <RichTextEditor
                        isMention={true}
                        isTag={true}
                        ref={messageInputRef}
                        handleInputChange={(value) => {
                            setMessage(value);
                        }}
                        className="leading-[1.6] flex-1 max-h-52 overflow-y-scroll scrollbar "
                        placeholder="Type your message..."
                    />

                    <EmojiPicker
                        placement="top"
                        contentRef={messageInputRef}
                        onAfterPicked={() => {
                            if (messageInputRef.current) setMessage(messageInputRef.current?.innerHTML);
                        }}
                        button={
                            <button className="outline-none mb-[1px] ms-2">
                                <SmileIcon className="text-default-600" size={20} />
                            </button>
                        }
                    />
                </div>
            </div>
            {message.trim().length > 0 ? (
                <Button isIconOnly variant="light" radius="full">
                    <SendHorizonalIcon size={20} />
                </Button>
            ) : (
                <Button isIconOnly variant="light" radius="full">
                    {/* <ThumbsUpIcon size={20} /> */}
                    <span className="text-[20px]">👍</span>
                </Button>
            )}
        </div>
    );
}
