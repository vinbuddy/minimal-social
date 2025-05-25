"use client";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ButtonProps, ModalFooter } from "@heroui/react";
import { TriangleAlertIcon } from "lucide-react";
import React, { isValidElement } from "react";

import { useLoading } from "@/hooks";
import { useTranslation } from "react-i18next";

interface IProps {
    okButtonProps?: ButtonProps;
    title?: string;
    description?: string | React.ReactNode;
    okButtonContent?: string | React.ReactNode;
    modalBackdrop?: "transparent" | "opaque" | "blur";
    icon?: React.ReactNode;
    iconBgColor?: string;
    iconColor?: string;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onOk: () => Promise<void>;
    onClose: () => void;
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
    okButtonProps,
    onOk,
    onOpenChange,
    onClose,
}: IProps): React.ReactNode {
    const { loading, startLoading, stopLoading } = useLoading();
    const { t } = useTranslation("common");

    return (
        <>
            <Modal backdrop={modalBackdrop} hideCloseButton isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader></ModalHeader>
                            <ModalBody className="pt-0 px-6 pb-6">
                                <div className="flex flex-col items-center">
                                    <div className={`p-4 rounded-full`} style={{ backgroundColor: iconBgColor }}>
                                        <span className={`text-3xl`} style={{ color: iconColor }}>
                                            {icon}
                                        </span>
                                    </div>
                                    <h4 className="text-center my-3 text-xl font-bold">{title}</h4>
                                    {/* Check desc is ReactNode */}

                                    {isValidElement(description) ? (
                                        description
                                    ) : (
                                        <p className="text-center text-default-500">{description}</p>
                                    )}
                                </div>
                            </ModalBody>
                            <ModalFooter className="flex justify-between">
                                <Button fullWidth color="default" variant="light" onPress={onClose}>
                                    {t("CANCEL")}
                                </Button>
                                <Button
                                    isLoading={loading}
                                    fullWidth
                                    color="danger"
                                    {...okButtonProps}
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
