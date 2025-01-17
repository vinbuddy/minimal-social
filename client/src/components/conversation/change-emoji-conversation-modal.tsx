"use client";

import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Spinner,
    useDisclosure,
} from "@heroui/react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useTheme } from "next-themes";
import { useState } from "react";
import { toast } from "sonner";

import axiosInstance from "@/utils/http-request";
import { showToast } from "@/utils/toast";
import { useGlobalMutation, useLoading } from "@/hooks";

interface IProps {
    children: React.ReactNode;
    defaultEmoji?: any;
    conversationId: string;
}

export default function ChangeEmojiConversationModal({ children, defaultEmoji, conversationId }: IProps) {
    const [emoji, setEmoji] = useState<any>(defaultEmoji);

    const { isOpen, onOpenChange, onOpen, onClose } = useDisclosure();
    const { theme } = useTheme();
    const { loading, startLoading, stopLoading } = useLoading();
    const mutate = useGlobalMutation();

    const handlePickEmoji = (emoji: any) => {
        setEmoji(emoji.native);
    };

    const handleChangeEmoji = async () => {
        try {
            startLoading();
            const res = await axiosInstance.put(`/conversation/change-emoji/${conversationId}`, { emoji });

            if (res.status === 200) {
                mutate((key) => typeof key === "string" && key.includes("/conversation"));

                showToast("Change emoji successfully", "success");
                onClose();
            }
        } catch (error) {
            console.log("ERROR CHANGE EMOJI", error);
            showToast("Change emoji failed", "error");
        } finally {
            stopLoading();
        }
    };

    return (
        <>
            <div className="cursor-pointer" onClick={onOpen}>
                {children}
            </div>

            <Modal scrollBehavior="inside" size="sm" isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex items-center justify-between gap-7">Change Emoji</ModalHeader>
                            <ModalBody className="!p-0 [&_div]:flex [&_div]:justify-center scrollbar">
                                <Picker
                                    style={{ width: "100%" }}
                                    emojiSize={18}
                                    theme={theme ?? "light"}
                                    data={data}
                                    maxFrequentRows={1}
                                    previewPosition="none"
                                    onEmojiSelect={handlePickEmoji}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button onClick={handleChangeEmoji} isLoading={loading} color="primary" fullWidth>
                                    {emoji ?? ""}&nbsp;Change
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
