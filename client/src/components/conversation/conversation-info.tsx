"use client";
import Link from "next/link";
import { Accordion, AccordionItem, Avatar, Button, Listbox, ListboxItem, useDisclosure } from "@heroui/react";
import {
    TrashIcon,
    PaletteIcon,
    SearchIcon,
    ThumbsUpIcon,
    UserIcon,
    FileIcon,
    LinkIcon,
    ArrowLeftIcon,
    Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import ConversationStorage from "./conversation-storage";
import ChangeEmojiConversationModal from "./change-emoji-conversation-modal";
import ChangeThemeConversationModal from "./change-theme-conversation-modal";
import ConfirmationModal from "../confirmation-modal";
import SearchMessage from "./search-message";
import UserName from "../user/user-name";

import { IUser } from "@/types/user";
import { IConversation } from "@/types/conversation";
import { ImageIcon } from "@/assets/icons";
import { showToast } from "@/utils/toast";
import axiosInstance from "@/utils/http-request";

interface IProps {
    partner?: IUser | null;
    conversation?: IConversation;
}

export default function ConversationInfo({ partner, conversation }: IProps) {
    const [storageType, setStorageType] = useState<"media" | "link" | "file" | null>(null);
    const [isSearchMode, setIsSearchMode] = useState<boolean>(false);
    const router = useRouter();
    const {
        isOpen: isOpenDelete,
        onOpen: onOpenDelete,
        onOpenChange: onOpenChangeDelete,
        onClose: onCloseDelete,
    } = useDisclosure();

    const handleDeleteConversation = async (): Promise<void> => {
        try {
            if (!conversation?._id) throw new Error("Conversation id is required");

            const res = await axiosInstance.delete(`/conversation/${conversation._id}`);

            if (res.status !== 200) {
                throw new Error("Delete conversation failed");
            }

            showToast("Deleted conversation", "success");

            router.replace("/conversation");
        } catch (err: any) {
            showToast(err.message, "error");
        }
    };

    if (!conversation || !partner) {
        return null;
    }

    if (isSearchMode) {
        return (
            <div id="search-message" className="h-screen overflow-auto bg-content1 border-divider px-4 scrollbar">
                <header className="min-h-[40px] flex items-center gap-2 pb-5 sticky pt-4 top-0 bg-content1 z-10">
                    <Button
                        onClick={() => setIsSearchMode(false)}
                        title="Back"
                        isIconOnly
                        radius="full"
                        variant="light"
                    >
                        <ArrowLeftIcon size={20} />
                    </Button>
                    <h1>Search message</h1>
                </header>

                <SearchMessage conversation={conversation} />
            </div>
        );
    }

    if (storageType) {
        return (
            <div id="conversation-storage" className="h-screen overflow-auto bg-content1 border-divider px-4 scrollbar">
                <header className="min-h-[40px] flex items-center gap-2 pb-5 sticky pt-4 top-0 bg-content1 z-10">
                    <Button onClick={() => setStorageType(null)} title="Back" isIconOnly radius="full" variant="light">
                        <ArrowLeftIcon size={20} />
                    </Button>
                    <h1>Conversation Storage</h1>
                </header>

                <div>
                    <ConversationStorage tab={storageType} conversationId={conversation._id} />
                </div>
            </div>
        );
    }

    return (
        <div id="conversation-info" className="h-screen overflow-auto border-divider bg-content1 p-4 scrollbar">
            <ConfirmationModal
                title="Delete this conversation ?"
                description="This conversation will be deleted for you"
                icon={<Trash2Icon size={24} />}
                isOpen={isOpenDelete}
                onOpenChange={onOpenDelete}
                onOk={handleDeleteConversation}
                onClose={onCloseDelete}
            />

            <section className="flex flex-col items-center">
                <div>
                    <Avatar
                        isBordered
                        classNames={{
                            base: "!w-24 !h-24 ring-offset-4",
                        }}
                        radius="full"
                        src={partner?.photo}
                    />
                    <UserName user={partner} className="justify-center mt-2 text-lg" />
                </div>

                <div className="flex gap-4 mt-4">
                    <Button
                        as={Link}
                        href={`/profile/${partner?._id}`}
                        variant="flat"
                        radius="full"
                        startContent={<UserIcon size={18} className="text-default-500" />}
                        className="text-default-500"
                    >
                        Profile
                    </Button>
                    <Button
                        variant="flat"
                        radius="full"
                        startContent={<SearchIcon size={18} className="text-default-500" />}
                        className="text-default-500"
                        onClick={() => setIsSearchMode(true)}
                    >
                        Search
                    </Button>
                </div>
            </section>

            <section className="mt-4">
                <div>
                    <Accordion
                        selectionMode="multiple"
                        showDivider={false}
                        itemClasses={{
                            base: "py-0 mb-2 w-full",
                            title: "font-normal text-medium",
                            trigger: "px-2 py-0  data-[hover=true]:bg-default-100 rounded-lg h-11 flex items-center ",
                            indicator: "text-medium",
                            content: "text-small p-0",
                        }}
                        defaultExpandedKeys={["1"]}
                    >
                        <AccordionItem key="1" aria-label="Accordion 2" title="Storage">
                            <div>
                                <Listbox variant="flat" className="p-0 pb-1 text-default-700">
                                    <ListboxItem
                                        classNames={{
                                            title: "!text-base",
                                        }}
                                        key="new"
                                        startContent={<ImageIcon size={18} className="text-default-600" />}
                                        onClick={() => setStorageType("media")}
                                    >
                                        Media files
                                    </ListboxItem>
                                    <ListboxItem
                                        classNames={{
                                            title: "!text-base",
                                        }}
                                        key="copy"
                                        startContent={<FileIcon size={18} />}
                                        onClick={() => setStorageType("file")}
                                    >
                                        Files
                                    </ListboxItem>
                                    <ListboxItem
                                        classNames={{
                                            title: "!text-base",
                                        }}
                                        key="link"
                                        startContent={<LinkIcon size={18} />}
                                        onClick={() => setStorageType("link")}
                                    >
                                        Links
                                    </ListboxItem>
                                </Listbox>
                            </div>
                        </AccordionItem>
                        <AccordionItem key="2" aria-label="Accordion 1" title="Settings">
                            <div>
                                <Listbox variant="flat" className="p-0 pb-1 text-default-700">
                                    <ListboxItem
                                        classNames={{
                                            title: "!text-base",
                                        }}
                                        key="new"
                                        startContent={<PaletteIcon size={18} />}
                                    >
                                        <ChangeThemeConversationModal conversation={conversation}>
                                            Theme
                                        </ChangeThemeConversationModal>
                                    </ListboxItem>
                                    <ListboxItem
                                        classNames={{
                                            title: "!text-base",
                                        }}
                                        key="copy"
                                        startContent={<ThumbsUpIcon size={18} />}
                                    >
                                        <ChangeEmojiConversationModal
                                            conversationId={conversation?._id}
                                            defaultEmoji={conversation?.emoji}
                                        >
                                            Emoji icon
                                        </ChangeEmojiConversationModal>
                                    </ListboxItem>
                                </Listbox>
                            </div>
                        </AccordionItem>
                        <AccordionItem key="3" aria-label="Accordion 3" title="Security">
                            <div>
                                <Listbox variant="flat" className="p-0 pb-1 text-default-700">
                                    <ListboxItem
                                        classNames={{
                                            title: "!text-base",
                                        }}
                                        color="danger"
                                        className="text-danger"
                                        key="delete"
                                        startContent={<TrashIcon size={18} />}
                                        onPress={onOpenChangeDelete}
                                    >
                                        Delete conversation
                                    </ListboxItem>
                                </Listbox>
                            </div>
                        </AccordionItem>
                    </Accordion>
                </div>
            </section>
        </div>
    );
}
