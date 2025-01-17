"use client";
import {
    Button,
    Popover,
    PopoverTrigger,
    PopoverContent,
    Avatar,
    Modal,
    ModalContent,
    ModalBody,
} from "@heroui/react";
import axios from "axios";
import { toast } from "sonner";
import { ImagePlusIcon, PlusIcon, SmileIcon } from "lucide-react";
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

import EmojiPicker from "../emoji-picker";
import MediaFileSlider from "../media/media-file-slider";
import MediaFileUploaderButton from "../media/media-file-uploader-button";
import RichTextEditor from "../rich-text-editor";

import { IMediaFile, IPost } from "@/types/post";
import { checkLimitSize, getFileDimension, getFileFormat } from "@/utils/media-file";
import axiosInstance from "@/utils/http-request";
import { useAuthStore } from "@/hooks/store";
import { useBreakpoint, useGlobalMutation, useLoading } from "@/hooks";
import { showToast } from "@/utils/toast";

interface IProps {
    type?: "create" | "edit";
    post?: IPost;
    children?: React.ReactNode;
    open?: boolean;
    setOpen?: Dispatch<SetStateAction<boolean>>;
}
export default function PostModalButton({ type = "create", post, children, open, setOpen }: IProps) {
    const [isOpen, setIsOpen] = useState<boolean>(!!open);
    const { currentUser } = useAuthStore();
    const { startLoading, stopLoading, loading } = useLoading();
    const mutate = useGlobalMutation();
    const breakpoint = useBreakpoint();

    const [mediaFiles, setMediaFiles] = useState<IMediaFile[]>(post?.mediaFiles ?? []);
    const [caption, setCaption] = useState<string>(post?.caption ?? "");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsOpen(open ?? false);
    }, [open]);

    useEffect(() => {
        const clickOutsidePopover = (event: MouseEvent) => {
            const isClickInsidePopover = popoverRef.current?.contains(event.target as Node);
            // const isClickInsideModal = modalRef.current?.contains(event.target as Node);

            const emojiPickerElement = document.querySelector("em-emoji-picker");
            const isClickInsideEmojiPicker = emojiPickerElement?.contains(event.target as Node);

            // // Determine if the click is outside both popover and emoji picker
            if (type === "edit" && !isClickInsidePopover && !isClickInsideEmojiPicker) {
                handleOpenChange(false);
            }
        };

        document.addEventListener("click", clickOutsidePopover);

        return () => {
            document.removeEventListener("click", clickOutsidePopover);
        };
    }, [popoverRef.current, type]);

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

    const handlePasteMediaFiles = async (event: React.ClipboardEvent<HTMLInputElement>) => {
        event.preventDefault();

        // Get images from clipboard
        const items = event.clipboardData.items;
        const files: any = [];

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
                files.push(items[i].getAsFile());
            }
        }

        if (files.length > 0) {
            const fileInfos: IMediaFile[] = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];

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
        }
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

    const reset = () => {
        if (loading) return;

        if (!contentRef.current) return;

        if (post?.caption) {
            contentRef.current.innerHTML = post.caption;
        } else {
            contentRef.current.innerHTML = "";
        }

        setMediaFiles([]);
        setCaption("");

        if (fileInputRef.current && type === "create") {
            const emptyFileList = new DataTransfer();
            fileInputRef.current.files = emptyFileList.files;
        }
    };

    const handleOpenChange = (_open: boolean) => {
        setIsOpen(_open);
        setOpen && setOpen(_open);
    };

    const handleCreatePost = async () => {
        if (!currentUser) {
            alert("Unauthenticated user found.");
            return;
        }

        if (caption.replace(/&nbsp;|<[^>]*>/g, "").trim().length === 0 && mediaFiles.length === 0) {
            alert("Caption and media files cannot be both empty.");
            return;
        }

        startLoading();

        const formData = new FormData();

        formData.append("caption", caption);
        formData.append("postBy", currentUser._id);

        if (mediaFiles.length > 0) {
            mediaFiles.forEach((mediaFile) => {
                formData.append("mediaFiles", mediaFile.file!);
            });
        }

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/post`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
            });

            const postResponse = response.data.data as IPost;

            // Notification
            if (postResponse.mentions.length > 0) {
                await axiosInstance.post("/notification", {
                    target: postResponse?._id,
                    targetType: "Post",
                    action: "mention",
                    photo: currentUser?.photo,
                    message: `mentioned you in a post`,
                    sender: currentUser?._id,
                    receivers: postResponse?.mentions?.map((user) => user?._id),
                    url: `/post/${postResponse?._id}`,
                });
            }

            mutate((key) => typeof key === "string" && key.includes("/post"));

            reset();
            setIsOpen(false);
            setOpen && setOpen(false);

            showToast("Post created successfully.", "success");
        } catch (error: any) {
            showToast(error.response.data.message, "error");
        } finally {
            stopLoading();
        }
    };

    const handleEditPost = async () => {
        if (!currentUser || !post?._id) {
            alert("Please login or post data.");
            return;
        }

        if (caption.replace(/&nbsp;|<[^>]*>/g, "").trim().length === 0) {
            alert("Caption cannot be both empty.");
            return;
        }

        startLoading();

        try {
            const response = await axiosInstance.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/post`, {
                caption,
                postId: post?._id,
            });

            mutate((key) => typeof key === "string" && key.includes("/post"));

            console.log(response.data);
            reset();
            setIsOpen(false);
            setOpen && setOpen(false);

            toast.success("Post edited successfully.", { position: "bottom-center" });
        } catch (error: any) {
            toast.error("Failed to edit post.", { position: "bottom-center" });
            toast.error(error.response.data.message, { position: "bottom-center" });

            console.log(error);
        } finally {
            stopLoading();
        }
    };

    const renderPostForm = () => {
        return (
            (<div>
                <div className="flex">
                    <section>
                        <Avatar size="lg" src={currentUser?.photo} />
                    </section>
                    <section className="ms-4 flex-1 max-w-full overflow-hidden">
                        <h4 className="text-sm font-semibold mb-1">{currentUser?.username || "Anonymous"}</h4>

                        <RichTextEditor
                            value={post?.caption || ""}
                            isMention={true}
                            isTag={true}
                            ref={contentRef}
                            handleInputChange={(value) => {
                                setCaption(value);
                            }}
                            onPaste={handlePasteMediaFiles}
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

                            {type === "create" && (
                                <MediaFileUploaderButton
                                    disableRipple
                                    className="bg-transparent p-0 gap-0 justify-start"
                                    isIconOnly
                                    size="sm"
                                    color="default"
                                    ref={fileInputRef}
                                    onUpload={uploadMediaFiles}
                                >
                                    <label htmlFor="file-input" className="cursor-pointer w-full">
                                        <ImagePlusIcon size={20} className="text-default-500" />
                                    </label>
                                </MediaFileUploaderButton>
                            )}
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
                <div className="flex justify-end mt-4 gap-2">
                    {breakpoint !== "mobile" && (
                        <Button
                            variant="light"
                            color="default"
                            onClick={() => {
                                setIsOpen(false);
                                setOpen && setOpen(false);
                            }}
                        >
                            Close
                        </Button>
                    )}
                    <Button
                        onClick={type === "create" ? handleCreatePost : handleEditPost}
                        isDisabled={
                            caption.replace(/&nbsp;|<[^>]*>/g, "").trim().length === 0 && mediaFiles.length === 0
                        }
                        color="default"
                        variant="bordered"
                        isLoading={loading}
                    >
                        {type === "create" ? "Post" : "Edit"}
                    </Button>
                </div>
            </div>)
        );
    };

    // Show modal if breakpoint is mobile
    if (breakpoint === "mobile") {
        return (
            <>
                {children ? (
                    children
                ) : (
                    <Button
                        onClick={() => {
                            setIsOpen(true);
                            setOpen && setOpen(true);
                        }}
                        color="primary"
                        isIconOnly
                        radius="full"
                        size="sm"
                    >
                        <PlusIcon />
                    </Button>
                )}
                <Modal placement="bottom" isOpen={isOpen} onOpenChange={handleOpenChange}>
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalBody className="!p-5">
                                    <div ref={popoverRef}>{renderPostForm()}</div>
                                </ModalBody>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </>
        );
    }

    return (
        <>
            <Popover
                placement="top-end"
                size="lg"
                shouldFlip
                backdrop="opaque"
                offset={type === "create" ? 20 : -20}
                defaultOpen={isOpen}
                isOpen={isOpen}
                onOpenChange={handleOpenChange}
                shouldCloseOnBlur
            >
                <PopoverTrigger>{children ? children : <Button color="primary">Create</Button>}</PopoverTrigger>
                <PopoverContent className="p-0">
                    <div ref={popoverRef} className="w-[calc(100vw_-_115px)] md:w-[598px] p-4">
                        {renderPostForm()}
                    </div>
                </PopoverContent>
            </Popover>
        </>
    );
}
