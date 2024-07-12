"use client";
import useLoading from "@/hooks/useLoading";
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
} from "@nextui-org/react";
import { TriangleAlertIcon } from "lucide-react";
import React from "react";

interface IProps {
    buttonProps?: ButtonProps;
    title?: string;
    description?: string;
    okButtonContent?: string;
    modalBackdrop?: "transparent" | "opaque" | "blur";
    icon?: React.ReactNode;
    iconBgColor?: string;
    iconColor?: string;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onOk: () => Promise<void>;
}

export default function ConfirmationModal({
    description = "This action cannot be undone. This will permanently delete the item",
    title = "You want to delete this item",
    modalBackdrop = "opaque",
    okButtonContent = "Delete",
    iconBgColor = "#fdd0df",
    iconColor = "#f31260",
    icon = <TriangleAlertIcon />,
    isOpen = false,
    onOk,
    onOpenChange,
}: IProps): React.ReactNode {
    const { loading, startLoading, stopLoading } = useLoading();
    return (
        <>
            <Modal backdrop={modalBackdrop} hideCloseButton isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader></ModalHeader>
                            <ModalBody className="pt-0 px-6 pb-6">
                                <div className="flex flex-col items-center">
                                    <div className={`p-4 rounded-full`} style={{ backgroundColor: iconBgColor }}>
                                        <span className={`text-3xl`} style={{ color: iconColor }}>
                                            {icon}
                                        </span>
                                    </div>
                                    <h4 className="my-3 text-xl font-bold">{title}</h4>
                                    <p className="text-center text-default-500">{description}</p>
                                </div>
                            </ModalBody>
                            <ModalFooter className="flex justify-between">
                                <Button fullWidth color="default" radius="full" variant="flat" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    isLoading={loading}
                                    fullWidth
                                    color="danger"
                                    radius="full"
                                    onPress={async () => {
                                        startLoading();
                                        await onOk();
                                        stopLoading();
                                        onClose();
                                    }}
                                >
                                    {okButtonContent}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
