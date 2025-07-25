"use client";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Button } from "@heroui/react";
import { SendHorizonalIcon, SmileIcon, StickerIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import RichTextEditor from "../rich-text-editor";
import EmojiPicker from "../emoji-picker";
import MediaFileUploaderButton from "../media/media-file-uploader-button";
import MediaFileSlider from "../media/media-file-slider";

import { ImageIcon } from "@/assets/icons";
import { IMediaFile } from "@/types/post";
import { checkLimitSize, getFileDimension, getFileFormat } from "@/utils/media-file";
import { IConversation } from "@/types/conversation";
import { showToast } from "@/utils/toast";
import { useAuthStore } from "@/hooks/store";
import { useGlobalMutation, useLoading } from "@/hooks";

import data from "@emoji-mart/data";

import { init } from "emoji-mart";
import useReplyStore from "@/hooks/store/use-reply-store";
import StickerGifDropdown from "../sticker-gif-dropdown";
import { ENV } from "@/config/env";
import { useTranslation } from "react-i18next";

init({ data });

interface IProps {
    conversation?: IConversation;
    mediaFiles?: IMediaFile[];
}

export default function MessageForm({ conversation, mediaFiles: _mediaFiles }: IProps) {
    const [message, setMessage] = useState<string>("");
    const [emoji, setEmoji] = useState<string>(conversation?.emoji ?? "👍");
    const [mediaFiles, setMediaFiles] = useState<IMediaFile[]>([]);

    const messageInputRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { currentUser } = useAuthStore();
    const { replyTo, unReply } = useReplyStore();
    const { startLoading, stopLoading, loading } = useLoading();
    const mutate = useGlobalMutation();

    const { t: tChat } = useTranslation("chat");

    useEffect(() => {
        if (_mediaFiles) {
            setMediaFiles((prev) => [...prev, ..._mediaFiles]);
        }
    }, [_mediaFiles]);

    useEffect(() => {
        return () => {
            unReply();
        };
    }, [unReply]);

    useEffect(() => {
        if (conversation) {
            setEmoji(conversation.emoji ?? "👍");
        }
    }, [conversation?.emoji, conversation]);

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
        // Get images from clipboard
        const items = event.clipboardData.items;
        const files: any = [];

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
                files.push(items[i].getAsFile());
            }
        }

        if (files.length > 0) {
            event.preventDefault();

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
        if (!messageInputRef.current) return;

        messageInputRef.current.innerHTML = "";

        setMediaFiles([]);
        setMessage("");

        if (fileInputRef.current) {
            const emptyFileList = new DataTransfer();
            fileInputRef.current.files = emptyFileList.files;
        }

        if (replyTo) unReply();
    };

    const handleSendMessage = async () => {
        if (!currentUser || !conversation) {
            alert("User or conversation not found.");
            return;
        }

        if (message.replace(/&nbsp;|<[^>]*>/g, "").trim().length === 0 && mediaFiles.length === 0) {
            alert("Message and media files cannot be both empty.");
            return;
        }

        startLoading();

        const formData = new FormData();
        const formMediaFilesData = new FormData();

        let formatMessage = message.replace(/<br>\s*$/, "");

        formData.append("content", formatMessage);
        formData.append("senderId", currentUser._id);
        formData.append("conversationId", conversation._id);

        formMediaFilesData.append("senderId", currentUser._id);
        formMediaFilesData.append("conversationId", conversation._id);

        if (replyTo) {
            formData.append("replyTo", replyTo?._id ?? null);
            formMediaFilesData.append("replyTo", replyTo?._id ?? null);
        }

        if (mediaFiles.length > 0) {
            mediaFiles.forEach((mediaFile) => {
                formMediaFilesData.append("mediaFiles", mediaFile.file!);
            });
        }

        try {
            // Send message
            if (message.trim().length > 0) {
                await axios.post(`${ENV.API_BASE_URL}/message`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true,
                });
            }

            // Send media files
            if (!message.trim().length && mediaFiles.length > 0) {
                await axios.post(`${ENV.API_BASE_URL}/message`, formMediaFilesData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true,
                });
            }

            // Send both message and media files
            if (mediaFiles.length > 0 && message.trim().length > 0) {
                await axios.post(`${ENV.API_BASE_URL}/message`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true,
                });

                await axios.post(`${ENV.API_BASE_URL}/message`, formMediaFilesData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true,
                });
            }

            mutate((key) => typeof key === "string" && key.includes("/conversation"));

            reset();
        } catch (error: any) {
            showToast("Failed to send message.", "error");

            console.log(error);
        } finally {
            stopLoading();
        }
    };

    const handleSendEmojiMessage = async () => {
        try {
            if (!currentUser || !conversation) return;
            startLoading();
            const formData = new FormData();

            formData.append("content", emoji);
            formData.append("senderId", currentUser._id);
            formData.append("conversationId", conversation._id);

            const response = await axios.post(`${ENV.API_BASE_URL}/message`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
            });

            mutate((key) => typeof key === "string" && key.includes("/conversation"));
            reset();
        } catch (error) {
            showToast("Failed to send message.", "error");
            console.log(error);
        } finally {
            stopLoading();
        }
    };

    const handleSendStickOrGifMessage = async (type: "sticker" | "gif", url: string) => {
        try {
            startLoading();

            if (!currentUser || !conversation || !url) return;

            const formData = new FormData();
            formData.append("conversationId", conversation._id);
            formData.append("senderId", currentUser._id);
            if (type === "gif") {
                formData.append("gifUrl", url);
            } else {
                formData.append("stickerUrl", url);
            }

            await axios.post(`${ENV.API_BASE_URL}/message`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
            });

            mutate((key) => typeof key === "string" && key.includes("/conversation"));
            reset();
        } catch (error) {
            showToast("Failed to send message.", "error");
            console.log(error);
        } finally {
            stopLoading();
        }
    };

    return (
        <div>
            {replyTo && (
                <div className="border-t border-divider py-2 px-5 flex justify-between items-center gap-4 bg-content2 mb-4">
                    <div className="flex-1 overflow-hidden">
                        <h4 className="text-sm ">
                            {tChat("CHAT.MESSAGE.REPLY_TO", {
                                username: replyTo?.sender?.username || "Unknown User",
                            })}
                        </h4>
                        <p className="text-default-500 text-sm truncate w-full mt-1">
                            {replyTo?.mediaFiles?.length > 0 && !replyTo?.content ? "Photo" : replyTo?.content}
                        </p>
                    </div>
                    <Button size="sm" radius="full" isIconOnly variant="light" onPress={() => unReply()}>
                        <XIcon size={20} className="text-default-500" />
                    </Button>
                </div>
            )}
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    if (message.trim() || mediaFiles.length > 0) {
                        handleSendMessage();
                    }
                }}
                className={`flex gap-x-2 px-4 pt-4 ${mediaFiles.length > 0 ? "items-end" : "items-center"}`}
            >
                <div>
                    <MediaFileUploaderButton
                        disableRipple
                        isIconOnly
                        radius="full"
                        color="default"
                        variant="light"
                        ref={fileInputRef}
                        onUpload={uploadMediaFiles}
                    >
                        <label
                            htmlFor="file-input"
                            className="w-full h-full flex items-center justify-center cursor-pointer"
                        >
                            <ImageIcon size={20} className="text-default-600" />
                        </label>
                    </MediaFileUploaderButton>
                    <input type="file" name="media-file" id="media-file" hidden />
                    <StickerGifDropdown
                        popoverProps={{ placement: "top-start" }}
                        onAfterPicked={handleSendStickOrGifMessage}
                    >
                        <Button isIconOnly variant="light" radius="full">
                            <StickerIcon size={20} className="text-default-600" strokeWidth={1.5} />
                        </Button>
                    </StickerGifDropdown>
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
                            onKeyDown={(event) => {
                                if (event.key === "Enter" && !event.shiftKey) {
                                    event.preventDefault();
                                    if (
                                        message.replace(/&nbsp;|<[^>]*>/g, "").trim().length > 0 ||
                                        mediaFiles.length > 0
                                    ) {
                                        handleSendMessage();
                                    }
                                }
                            }}
                            onPaste={handlePasteMediaFiles}
                            className="leading-[1.6] flex-1 max-h-52 overflow-y-scroll scrollbar "
                            placeholder={tChat("CHAT.MESSAGE_PLACEHOLDER")}
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
                {message.trim().length > 0 || mediaFiles?.length > 0 ? (
                    <Button isLoading={loading} type="submit" isIconOnly variant="light" radius="full">
                        <SendHorizonalIcon size={20} />
                    </Button>
                ) : (
                    <Button
                        onPress={handleSendEmojiMessage}
                        isLoading={loading}
                        type="button"
                        isIconOnly
                        variant="light"
                        radius="full"
                    >
                        <span className="text-[20px]">{emoji}</span>
                    </Button>
                )}
            </form>
        </div>
    );
}
