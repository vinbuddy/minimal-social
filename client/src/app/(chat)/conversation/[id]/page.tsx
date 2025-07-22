"use client";
import { Avatar, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, Tooltip, useDisclosure } from "@heroui/react";
import { ArrowLeftIcon, InfoIcon, Phone, Video } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { FileRejection, useDropzone } from "react-dropzone";

import ConversationInfo from "@/components/conversation/conversation-info";
import MessageForm from "@/components/message/message-form";
import MessageList from "@/components/message/message-list";
import UserName from "@/components/user/user-name";

import { IConversation } from "@/types/conversation";
import { useConversationContext } from "@/contexts/conversation-context";
import { IMediaFile } from "@/types/post";
import { checkLimitSize, getFileDimension, getFileFormat } from "@/utils/media-file";
import { showToast } from "@/utils/toast";
import { useIsBlockMode, useOtherUserConversation } from "@/hooks";
import CallSetupModal from "@/components/call/call-setup-modal";
import { useTranslation } from "react-i18next";

function ConversationDetailPage() {
    const [isOpenConversationInfo, setIsOpenConversationInfo] = useState<boolean>(false);
    const [mediaFiles, setMediaFiles] = useState<IMediaFile[]>([]);

    const params = useParams<{ id: string }>();

    const { data } = useSWR<{ data: IConversation }>(`/conversation/${params.id}`);
    const otherUser = useOtherUserConversation(data?.data);
    const isBlockMode = useIsBlockMode({
        conversation: data?.data,
    });

    const { onBack } = useConversationContext();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const { t } = useTranslation("common");
    const { t: tChat } = useTranslation("chat");

    const handleOnDropFiles = async (files: File[]) => {
        if (!files) {
            return;
        }

        const fileInfos: IMediaFile[] = [];
        for (let i = 0; i < files?.length; i++) {
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
    };

    const handleOnDropRejectedFiles = (rejectedFiles: FileRejection[]) => {
        const errorMessages = rejectedFiles.map((file) => {
            const fileName = file.file.name;
            const error = file.errors[0];

            if (error.code === "file-invalid-type") {
                return `File "${fileName}" is not supported`;
            }

            if (error.code === "file-too-large") {
                return `File "${fileName}" exceeds the size limit`;
            }

            return `File "${fileName}" could not be uploaded`;
        });

        showToast(errorMessages.join("\n"), "error");
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: handleOnDropFiles,
        onDropRejected: handleOnDropRejectedFiles,
        noClick: true,
        accept: {
            "image/jpeg": [],
            "image/png": [],
            "video/mp4": [],
            "video/quicktime": [],
        },
    });

    return (
        <div className="grid grid-cols-12 h-full">
            <section
                className={`col-span-12 sm:col-span-12 ${
                    isOpenConversationInfo
                        ? "md:col-span-8 lg:col-span-8 xl:col-span-8 2xl:col-span-8"
                        : "md:col-span-12 lg:col-span-12 xl:col-span-12 2xl:col-span-12"
                }`}
            >
                <div {...getRootProps()} className="h-screen flex flex-col justify-between overflow-auto py-4">
                    <input {...getInputProps()} />
                    {/* User - Actions */}
                    <header className="min-h-[40px] flex items-center justify-between pb-5 px-4  border-b-1 border-divider">
                        <div className="flex items-center cursor-pointer">
                            <div className="me-3 lg:hidden block">
                                <Button onPress={onBack} title="Back" isIconOnly radius="full" variant="light">
                                    <ArrowLeftIcon size={20} />
                                </Button>
                            </div>

                            <Avatar radius="full" src={otherUser?.photo} />

                            <div className="ms-3">
                                <UserName user={otherUser} className="font-semibold hover:no-underline" />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button size="sm" isIconOnly color="default" variant="light">
                                <CallSetupModal>
                                    <Phone size={18} />
                                </CallSetupModal>
                            </Button>
                            <Tooltip content="Video call">
                                <Button size="sm" isIconOnly color="default" variant="light">
                                    <Video size={18} />
                                </Button>
                            </Tooltip>
                            <div className="lg:block hidden">
                                <Button
                                    onPress={() => setIsOpenConversationInfo(!isOpenConversationInfo)}
                                    size="sm"
                                    isIconOnly
                                    color="default"
                                    variant={isOpenConversationInfo ? "flat" : "light"}
                                >
                                    <InfoIcon size={18} />
                                </Button>
                            </div>
                            <div className="lg:hidden block">
                                <Button
                                    onPress={onOpen}
                                    size="sm"
                                    isIconOnly
                                    color="default"
                                    variant={isOpenConversationInfo ? "flat" : "light"}
                                >
                                    <InfoIcon size={18} />
                                </Button>
                            </div>
                        </div>
                    </header>

                    {isDragActive && (
                        <div className="p-5 h-full overflow-hidden">
                            <div className="rounded-2xl border-2 border-dashed border-default w-full overflow-y-auto overflow-x-hidden h-full flex justify-center items-center">
                                <h4>{t("DRAG_AND_DROP")}</h4>
                            </div>
                        </div>
                    )}

                    {/* Message */}
                    {data?.data && !isDragActive && <MessageList conversation={data?.data} />}

                    {isBlockMode && (
                        <div className="flex justify-center items-center gap-x-2 px-4 pt-4 border-t border-default">
                            <span className="text-default-500 text-sm">{tChat("CHAT.SEND_MESSAGE_BLOCKED")}</span>
                        </div>
                    )}

                    {/* Message Form */}
                    {data?.data && !isBlockMode && (
                        <MessageForm
                            conversation={data?.data}
                            mediaFiles={mediaFiles?.length > 0 ? mediaFiles : undefined}
                        />
                    )}
                </div>
            </section>
            {isOpenConversationInfo && (
                <section className="col-span-12 sm:col-span-12 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4 border-default border-l">
                    <ConversationInfo conversation={data?.data} partner={otherUser} />
                </section>
            )}

            <Drawer
                classNames={{
                    base: "!rounded-none",
                }}
                isOpen={isOpen}
                onOpenChange={onOpenChange}
            >
                <DrawerContent>
                    {(onClose) => (
                        <>
                            <DrawerHeader className="flex items-center gap-2"></DrawerHeader>
                            <DrawerBody className="!px-0">
                                <ConversationInfo conversation={data?.data} partner={otherUser} />
                            </DrawerBody>
                        </>
                    )}
                </DrawerContent>
            </Drawer>
        </div>
    );
}

export default ConversationDetailPage;
