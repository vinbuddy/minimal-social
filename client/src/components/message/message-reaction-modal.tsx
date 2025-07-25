"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, useDisclosure, ModalFooter, Tabs, Tab } from "@heroui/react";
import { useState } from "react";
import useSWR from "swr";
import { TRANSITION_EASINGS } from "@heroui/framer-utils";

import UserItem from "../user/user-item";
import UserSkeletons from "../user/user-skeletons";
import { IMessage } from "@/types/message";
import ErrorMessage from "../error-message";
import { useTranslation } from "react-i18next";

interface IProps {
    children: React.ReactNode;
    messageId?: string;
}

export default function MessageReactionModal({ children, messageId }: IProps) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [emoji, setEmoji] = useState("❤️");
    const { t: tChat } = useTranslation("chat");

    const {
        data: reactionData,
        error,
        isLoading,
    } = useSWR<{ data: IMessage }>(
        messageId && isOpen && emoji ? `/message/reaction?messageId=${messageId}&emoji=${emoji}` : null
    );

    return (
        <>
            <div onClick={onOpen}>{children}</div>
            <Modal
                size="lg"
                scrollBehavior="inside"
                hideCloseButton
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                motionProps={{
                    variants: {
                        enter: {
                            scale: 1,
                            y: "var(--slide-enter)",
                            opacity: 1,
                            transition: {
                                scale: {
                                    duration: 0.4,
                                    ease: TRANSITION_EASINGS.ease,
                                },
                                opacity: {
                                    duration: 0.4,
                                    ease: TRANSITION_EASINGS.ease,
                                },
                                y: {
                                    type: "spring",
                                    bounce: 0,
                                    duration: 0.6,
                                },
                            },
                        },
                        exit: {
                            scale: 1.1, // NextUI default 1.03
                            y: "var(--slide-exit)",
                            opacity: 0,
                            transition: {
                                duration: 0.3,
                                ease: TRANSITION_EASINGS.ease,
                            },
                        },
                    },
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex items-center justify-between">
                                {tChat("CHAT.MESSAGE.REACTION")}
                            </ModalHeader>
                            <ModalBody id="message-reaction" className="py-0 px-6 scrollbar">
                                <div>
                                    <Tabs
                                        onSelectionChange={(key) => setEmoji(key.toString() as typeof emoji)}
                                        size="md"
                                        fullWidth
                                    >
                                        <Tab
                                            key="heart"
                                            title={<div className="flex items-center text-xl space-x-2">❤️</div>}
                                        />
                                        <Tab
                                            key="haha"
                                            title={<div className="flex items-center text-xl space-x-2">😆</div>}
                                        />
                                        <Tab
                                            key="wow"
                                            title={<div className="flex items-center text-xl space-x-2">😮</div>}
                                        />
                                        <Tab
                                            key="sad"
                                            title={<div className="flex items-center text-xl space-x-2">😢</div>}
                                        />
                                        <Tab
                                            key="angry"
                                            title={<div className="flex items-center text-xl space-x-2">😡</div>}
                                        />
                                    </Tabs>
                                    <div className="mt-5">
                                        {error && !isLoading && <ErrorMessage error={error} className="text-center" />}

                                        {reactionData?.data?.reactions?.length === 0 && !isLoading && !error && (
                                            <p className="text-center">{tChat("CHAT.MESSAGE.REACTION_EMPTY")}</p>
                                        )}
                                        {!error && reactionData?.data && (
                                            <>
                                                {reactionData?.data?.reactions?.map((reaction) => (
                                                    <UserItem key={reaction?.user?._id} user={reaction?.user} />
                                                ))}
                                            </>
                                        )}
                                        {isLoading && <UserSkeletons length={3} />}
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter></ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
