"use client";

import { HeartIcon, RepostIcon } from "@/assets/icons";
import {
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    useDisclosure,
    Image,
    ButtonProps,
    ModalFooter,
    Tabs,
    Tab,
    Chip,
} from "@nextui-org/react";
import UserItem from "../User/UserItem";

interface IProps {
    buttonProps: ButtonProps;
}

export default function PostActivitiesModalButton({ buttonProps }: IProps) {
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

    return (
        <>
            <Button {...buttonProps} onClick={onOpen} />
            <Modal size="lg" scrollBehavior="inside" hideCloseButton isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex items-center justify-between">
                                Post Activities
                                <Tabs size="sm" variant="solid">
                                    <Tab
                                        key="photos"
                                        title={
                                            <div className="flex items-center space-x-2">
                                                <HeartIcon size={18} />
                                                <span>Likes</span>
                                                <Chip size="sm" variant="faded">
                                                    9
                                                </Chip>
                                            </div>
                                        }
                                    />
                                    <Tab
                                        key="music"
                                        title={
                                            <div className="flex items-center space-x-2">
                                                <RepostIcon size={18} />
                                                <span>Repost</span>
                                                <Chip size="sm" variant="faded">
                                                    4
                                                </Chip>
                                            </div>
                                        }
                                    />
                                </Tabs>
                            </ModalHeader>
                            <ModalBody className="py-0 px-6 scrollbar">
                                <div>
                                    <UserItem />
                                    <UserItem />
                                    <UserItem />
                                    <UserItem />
                                    <UserItem />
                                    <UserItem />
                                    <UserItem />
                                    <UserItem />
                                    <UserItem />
                                    <UserItem />
                                    <UserItem />
                                    <UserItem />
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
