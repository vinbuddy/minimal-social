"use client";

import {
    Button,
    Chip,
    Listbox,
    ListboxItem,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Selection,
    useDisclosure,
} from "@heroui/react";
import { useMemo, useState } from "react";
import useSWR from "swr";

import { IConversation } from "@/types/conversation";
import { ITheme } from "@/types/theme";
import { useGlobalMutation, useLoading } from "@/hooks";
import axiosInstance from "@/utils/http-request";
import { showToast } from "@/utils/toast";
import { CheckIcon } from "lucide-react";

interface IProps {
    children: React.ReactNode;
    conversation: IConversation;
}

export default function ChangeThemeConversationModal({ children, conversation }: IProps) {
    const { data: result, isLoading: isThemeLoading } = useSWR<{ data: ITheme[] }>("/theme");
    const { isOpen, onOpenChange, onOpen, onClose } = useDisclosure();
    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
    const { loading, startLoading, stopLoading } = useLoading();
    const mutate = useGlobalMutation();

    const themes: ITheme[] = useMemo(() => result?.data ?? [], [result]);

    const selectedTheme = useMemo(
        () => themes.find((theme) => theme._id === Array.from(selectedKeys).join(", ")) ?? conversation?.theme,
        [selectedKeys, themes]
    );

    const handleChangeTheme = async () => {
        try {
            if (!selectedTheme || !conversation) throw new Error("Theme or conversation not found");

            startLoading();

            await axiosInstance.put(`/conversation/change-theme/${conversation._id}`, {
                themeId: selectedTheme?._id,
            });

            mutate((key) => typeof key === "string" && key.includes("/conversation"));

            showToast("Change theme successfully", "success");
        } catch (error: any) {
            console.error(error);
            showToast(error.message, "error");
        } finally {
            stopLoading();

            onClose();
        }
    };

    return (
        <>
            <div className="cursor-pointer" onClick={onOpen}>
                {children}
            </div>

            <Modal scrollBehavior="inside" size="2xl" isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex items-center justify-between gap-7">
                                Preview & Change Theme
                            </ModalHeader>
                            <ModalBody className="grid grid-cols-2 gap-5 scrollbar">
                                <section>
                                    <div
                                        className="flex gap-3 items-center px-2 pb-4 border-b cursor-pointer"
                                        onClick={() => setSelectedKeys(new Set())}
                                    >
                                        <div
                                            className="size-7 rounded-full flex justify-center items-center"
                                            style={{ backgroundColor: conversation?.theme?.color }}
                                        >
                                            <div className="size-2 rounded-full bg-content2"></div>
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <span className="text-small">{conversation?.theme?.name}</span>
                                            <span className="text-tiny text-default-400">
                                                {conversation?.theme?.description}
                                            </span>
                                        </div>
                                        <Chip color="default" variant="bordered">
                                            Current theme
                                        </Chip>
                                    </div>
                                    <Listbox
                                        className="px-0 overflow-visible"
                                        disallowEmptySelection
                                        items={themes}
                                        selectedKeys={selectedKeys}
                                        selectionMode="single"
                                        variant="flat"
                                        onSelectionChange={(keys: Selection) => setSelectedKeys(new Set(keys))}
                                    >
                                        {(item) => (
                                            <ListboxItem key={item._id} textValue={item.name}>
                                                <div className="flex gap-3 items-center">
                                                    <div
                                                        className="size-7 rounded-full flex justify-center items-center"
                                                        style={{ backgroundColor: item.color }}
                                                    >
                                                        <div className="size-2 rounded-full bg-content2"></div>
                                                    </div>
                                                    <div className="flex flex-col flex-1">
                                                        <span className="text-small">{item.name}</span>
                                                        <span className="text-tiny text-default-400">
                                                            {item.description}
                                                        </span>
                                                    </div>
                                                </div>
                                            </ListboxItem>
                                        )}
                                    </Listbox>
                                </section>
                                {/* Preview */}
                                <section>
                                    <div className="group flex items-center gap-2 justify-end w-full mb-5 cursor-pointer">
                                        <span
                                            style={{ backgroundColor: selectedTheme?.color ?? "#333" }}
                                            className="p-3 rounded-3xl text-white max-w-[65%]"
                                        >
                                            Hello Peter, how are you doing today?
                                        </span>
                                    </div>
                                    <div className="group flex items-center gap-2 justify-start w-full">
                                        <span className="p-3 rounded-3xl text-content2-foreground max-w-[65%] bg-content2">
                                            I am doing great, thank you for asking!
                                        </span>
                                    </div>
                                </section>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="default" variant="light" fullWidth onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" fullWidth isLoading={loading} onClick={handleChangeTheme}>
                                    Change theme
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
