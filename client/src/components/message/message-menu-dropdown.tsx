import { IMessage } from "@/types/message";
import { showToast } from "@/utils/toast";
import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    useDisclosure,
} from "@nextui-org/react";
import { CopyIcon, InfoIcon, PinIcon, RotateCcwIcon, Trash2Icon } from "lucide-react";
import ConfirmationModal from "../confirmation-modal";
import { useAuthStore, useMessagesStore } from "@/hooks/store";
import axiosInstance from "@/utils/httpRequest";

interface IProps {
    message: IMessage;
    isOwnMessage: boolean;
    children: React.ReactNode;
}

export default function MessageMenuDropdown({ message, isOwnMessage, children }: IProps) {
    const {
        isOpen: isOpenDelete,
        onOpen: onOpenDelete,
        onOpenChange: onOpenChangeDelete,
        onClose: onCloseDelete,
    } = useDisclosure();
    const {
        isOpen: isOpenRetract,
        onOpen: onOpenRetract,
        onOpenChange: onOpenChangeRetract,
        onClose: onCloseRetract,
    } = useDisclosure();
    const { messageList, setMessageList } = useMessagesStore();

    const handleCopy = async (): Promise<void> => {
        try {
            await navigator.clipboard.writeText(message.content);
            showToast("Copied message", "success");
        } catch (err) {
            showToast("Copy message failed", "error");
        }
    };

    const handleDeleteMessage = async (): Promise<void> => {
        try {
            if (!message._id) throw new Error("Message id is required");

            const res = await axiosInstance.delete(`/message/delete/${message._id}`);

            if (res.status !== 200) {
                throw new Error("Delete message failed");
            }

            const newMessageList = messageList.filter((msg) => msg._id !== message._id);
            setMessageList(newMessageList);

            showToast("Deleted message", "success");
        } catch (err) {
            showToast("Delete message failed", "error");
        }
    };

    const handleRetractMessage = async (): Promise<void> => {
        try {
            if (!message._id) throw new Error("Message id is required");

            const res = await axiosInstance.delete(`/message/retract/${message._id}`);

            if (res.status !== 200) {
                throw new Error("Retract message failed");
            }

            // Update isRetracted field of the message
            const newMessageList = messageList.map((msg) => {
                if (msg._id === message._id) {
                    return { ...msg, isRetracted: true };
                }
                return msg;
            });

            setMessageList(newMessageList);

            showToast("Retracted message", "success");
        } catch (err: any) {
            showToast("Retract message failed", err.message);
        }
    };

    return (
        <>
            <ConfirmationModal
                title="Delete this message ?"
                description="This message will be deleted for you"
                icon={<Trash2Icon size={24} />}
                isOpen={isOpenDelete}
                onOpenChange={onOpenDelete}
                onOk={handleDeleteMessage}
                onClose={onCloseDelete}
            />
            <ConfirmationModal
                title="Retract this message ?"
                description="This message will be deleted for everyone"
                icon={<RotateCcwIcon size={24} />}
                isOpen={isOpenRetract}
                onOpenChange={onOpenRetract}
                onOk={handleRetractMessage}
                onClose={onCloseRetract}
            />
            <Dropdown placement="bottom" disableAnimation={true}>
                <DropdownTrigger>{children}</DropdownTrigger>
                <DropdownMenu aria-label="Profile Actions" variant="flat">
                    <DropdownSection aria-label="info" showDivider={isOwnMessage && !message?.isRetracted}>
                        <DropdownItem
                            textValue=""
                            startContent={<CopyIcon size={16} />}
                            key="copy"
                            onPress={handleCopy}
                        >
                            Copy message
                        </DropdownItem>
                        <>
                            {!message?.isRetracted && (
                                <DropdownItem
                                    aria-label="pin"
                                    textValue=""
                                    startContent={<PinIcon size={16} />}
                                    key="pin"
                                >
                                    Pin message
                                </DropdownItem>
                            )}
                        </>
                    </DropdownSection>
                    {isOwnMessage && !message?.isRetracted ? (
                        <>
                            <DropdownItem
                                aria-label="delete"
                                textValue=""
                                startContent={<Trash2Icon size={16} />}
                                key="delete"
                                color="danger"
                                className="text-danger"
                                onPress={onOpenChangeDelete}
                            >
                                Delete message
                            </DropdownItem>
                            <DropdownItem
                                aria-label="retract"
                                textValue=""
                                startContent={<RotateCcwIcon size={16} />}
                                key="retract"
                                color="danger"
                                className="text-danger"
                                onPress={onOpenChangeRetract}
                            >
                                Retract message
                            </DropdownItem>
                        </>
                    ) : (
                        <></>
                    )}
                </DropdownMenu>
            </Dropdown>
        </>
    );
}
