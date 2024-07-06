"use client";
import {
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    useDisclosure,
    Image,
    ButtonProps,
    Popover,
    PopoverTrigger,
    PopoverContent,
    Avatar,
} from "@nextui-org/react";
import EmojiPicker from "../EmojiPicker";
import { ImagePlusIcon, SmileIcon } from "lucide-react";

interface IDefaultProps {
    buttonProps?: ButtonProps;
}

export default function PostModalButton(): React.ReactNode {
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

    return (
        <>
            <Popover placement="top-end" size="lg" backdrop="opaque" offset={20}>
                <PopoverTrigger>
                    <Button color="primary">Create</Button>
                </PopoverTrigger>
                <PopoverContent>
                    <div className="w-[580px] p-4">
                        <div className="flex gap-4">
                            <div>
                                <Avatar size="lg" src="https://avatars.githubusercontent.com/u/94288269?v=4" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-semibold mb-1">Vinbuddy</h4>
                                <div
                                    suppressContentEditableWarning={true}
                                    // ref={inputInnerRef}
                                    className={`text-sm input-editor`}
                                    aria-placeholder="What's on your mind?"
                                    contentEditable={true}
                                ></div>
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
                                        onChange={() => {}}
                                    />
                                    <Button
                                        disableRipple
                                        className="bg-transparent p-0 gap-0 justify-start"
                                        isIconOnly
                                        size="sm"
                                        color="default"
                                        aria-label="Like"
                                    >
                                        <ImagePlusIcon size={20} className="text-default-500" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button isDisabled color="default" variant="bordered">
                                Post
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
            {/* <Button onPress={onOpen} color="primary">
                Create
            </Button> */}

            {/* <Modal size="xl" isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Create new post</ModalHeader>
                            <ModalBody className="pt-0 px-6 pb-6">
                                <div></div>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal> */}
        </>
    );
}
