"use client";
import { Button, useDisclosure, Popover, PopoverTrigger, PopoverContent, Avatar } from "@nextui-org/react";
import EmojiPicker from "../EmojiPicker";
import { ImagePlusIcon, SmileIcon } from "lucide-react";
import MediaFileSlider from "../Media/MediaFileSlider";
import { ChangeEvent, useRef, useState } from "react";
import { IMediaFile, IPost } from "@/types/post";
import { checkLimitSize, getFileDimension, getFileFormat } from "@/utils/mediaFile";
import MediaFileUploaderButton from "../Media/MediaFileUploaderButton";
import RichTextEditor from "../RichTextEditor";

interface IProps {
    type?: "create" | "edit";
    post?: IPost;
}

export default function PostModalButton({ type = "create", post }: IProps): React.ReactNode {
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

    const [mediaFiles, setMediaFiles] = useState<IMediaFile[]>(post?.mediaFiles ?? []);
    const [caption, setCaption] = useState<string>(post?.caption ?? "");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

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
        <>
            <Popover placement="top-end" size="lg" backdrop="opaque" offset={20}>
                <PopoverTrigger>
                    <Button color="primary">Create</Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                    <div className="w-[598px] p-4 ">
                        <div className="flex">
                            <section>
                                <Avatar size="lg" src="https://avatars.githubusercontent.com/u/94288269?v=4" />
                            </section>
                            <section className="ms-4 flex-1 max-w-full overflow-hidden">
                                <h4 className="text-sm font-semibold mb-1">Vinbuddy</h4>

                                <RichTextEditor
                                    value={post?.caption || ""}
                                    isMention={true}
                                    isTag={true}
                                    ref={contentRef}
                                    handleInputChange={(value) => {
                                        setCaption(value);
                                    }}
                                    className="w-full"
                                />
                                <div className="mt-2">
                                    <EmojiPicker
                                        placement="top"
                                        button={
                                            <Button
                                                disableRipple
                                                className="bg-transparent p-0 gap-0 justify-start"
                                                isIconOnly
                                                size="sm"
                                                color="default"
                                                aria-label="Like"
                                            >
                                                <SmileIcon size={20} className="text-default-500" />
                                            </Button>
                                        }
                                        contentRef={contentRef}
                                        onAfterPicked={() => {
                                            setCaption(contentRef.current?.innerHTML ?? "");
                                        }}
                                    />
                                    {/* <Button
                                            disableRipple
                                            className="bg-transparent p-0 gap-0 justify-start"
                                            isIconOnly
                                            size="sm"
                                            color="default"
                                            aria-label="Like"
                                        >
                                            <ImagePlusIcon size={20} className="text-default-500" />
                                        </Button> */}
                                    <MediaFileUploaderButton
                                        buttonProps={{
                                            disableRipple: true,
                                            className: "bg-transparent p-0 gap-0 justify-start",
                                            isIconOnly: true,
                                            size: "sm",
                                            color: "default",
                                            children: (
                                                <>
                                                    <label htmlFor="file-input" className="cursor-pointer w-full">
                                                        <ImagePlusIcon size={20} className="text-default-500" />
                                                    </label>
                                                </>
                                            ),
                                        }}
                                        ref={fileInputRef}
                                        onUpload={uploadMediaFiles}
                                    />
                                </div>
                                <div className="max-w-full overflow-hidden">
                                    <div className="mt-2">
                                        <MediaFileSlider
                                            scrollHorizontally
                                            videoPreview={true}
                                            mediaFiles={mediaFiles}
                                            onRemoveMediaFile={type === "create" ? removeMediaFiles : undefined}
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>
                        <div className="flex justify-end mt-4">
                            <Button
                                isDisabled={
                                    caption.replace(/&nbsp;|<[^>]*>/g, "").trim().length === 0 &&
                                    mediaFiles.length === 0
                                }
                                color="default"
                                variant="bordered"
                            >
                                Post
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </>
    );
}
