"use client";

import {
    Button,
    Listbox,
    ListboxItem,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Selection,
    useDisclosure,
} from "@nextui-org/react";

import { Key, useMemo, useState } from "react";
import { IConversation } from "@/types/conversation";

interface IProps {
    children: React.ReactNode;
    conversation: IConversation;
}

const themes = [
    {
        _id: 1,
        name: "Theme 1",
        description: "This is theme 1",
        color: "#f44336",
    },
    {
        _id: 2,
        name: "Theme 2",
        description: "This is theme 2",
        color: "#2196f3",
    },
    {
        _id: 3,
        name: "Theme 3",
        description: "This is theme 3",
        color: "#4caf50",
    },
    {
        _id: 4,
        name: "Theme 4",
        description: "This is theme 4",
        color: "#ff9800",
    },
    {
        _id: 5,
        name: "Theme 5",
        description: "This is theme 5",
        color: "#9c27b0",
    },
    {
        _id: 6,
        name: "Theme 6",
        description: "This is theme 6",
        color: "#795548",
    },
    {
        _id: 7,
        name: "Theme 7",
        description: "This is theme 7",
        color: "#607d8b",
    },
    {
        _id: 8,
        name: "Theme 8",
        description: "This is theme 8",
        color: "#00bcd4",
    },
    {
        _id: 9,
        name: "Theme 9",
        description: "This is theme 9",
        color: "#ffeb3b",
    },
    {
        _id: 10,
        name: "Theme 10",
        description: "This is theme 10",
        color: "#ff5722",
    },
    {
        _id: 11,
        name: "Theme 11",
        description: "This is theme 11",
        color: "#9e9e9e",
    },
    {
        _id: 12,
        name: "Theme 12",
        description: "This is theme 12",
        color: "#3f51b5",
    },
    {
        _id: 13,
        name: "Theme 13",
        description: "This is theme 13",
        color: "#8bc34a",
    },
    {
        _id: 14,
        name: "Theme 14",
        description: "This is theme 14",
        color: "#e91e63",
    },
    {
        _id: 15,
        name: "Theme 15",
        description: "This is theme 15",
        color: "#cddc39",
    },
    {
        _id: 16,
        name: "Theme 16",
        description: "This is theme 16",
        color: "#673ab7",
    },
    {
        _id: 17,
        name: "Theme 17",
        description: "This is theme 17",
        color: "#ff9800",
    },
    {
        _id: 18,
        name: "Theme 18",
        description: "This is theme 18",
        color: "#4caf50",
    },
    {
        _id: 19,
        name: "Theme 19",
        description: "This is theme 19",
        color: "#2196f3",
    },
    {
        _id: 20,
    },
];

export default function ChangeThemeConversationModal({ children, conversation }: IProps) {
    const { isOpen, onOpenChange, onOpen } = useDisclosure();
    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set(["text"]));

    const selectedThemeId = useMemo(() => Array.from(selectedKeys).join(", "), [selectedKeys]);

    return (
        <>
            <div className="cursor-pointer" onClick={onOpen}>
                {children}
            </div>

            <Modal scrollBehavior="inside" size="lg" isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex items-center justify-between gap-7">Change Theme</ModalHeader>
                            <ModalBody className="scrollbar">
                                <Listbox
                                    className="px-0 overflow-visible"
                                    disallowEmptySelection
                                    items={themes}
                                    selectedKeys={selectedKeys}
                                    defaultSelectedKeys={[themes[0]._id]}
                                    selectionMode="single"
                                    variant="flat"
                                    onSelectionChange={(keys: Selection) => setSelectedKeys(new Set(keys))}
                                >
                                    {(item) => (
                                        <ListboxItem key={item._id} textValue={item.name}>
                                            <div className="flex gap-2 items-center">
                                                <div
                                                    className="size-7 rounded-full flex justify-center items-center"
                                                    style={{ backgroundColor: item.color }}
                                                >
                                                    <div className="size-3 rounded-full bg-content2"></div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-small">{item.name}</span>
                                                    <span className="text-tiny text-default-400">
                                                        {item.description}
                                                    </span>
                                                </div>
                                            </div>
                                        </ListboxItem>
                                    )}
                                </Listbox>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="default" variant="light" onClick={onClose} fullWidth>
                                    Cancel
                                </Button>
                                <Button color="primary" fullWidth>
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
