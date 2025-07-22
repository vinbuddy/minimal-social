import { IMessage } from "@/types/message";
import { showToast } from "@/utils/toast";
import { Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, useDisclosure } from "@heroui/react";
import { CopyIcon, PinIcon, RotateCcwIcon, Trash2Icon } from "lucide-react";
import ConfirmationModal from "../confirmation-modal";
import { useMessagesStore } from "@/hooks/store";
import axiosInstance from "@/utils/http-request";
import { useCopyToClipboard } from "@/hooks";
import { useTranslation } from "react-i18next";

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
    const copy = useCopyToClipboard();
    const { t: tChat } = useTranslation("chat");

    const handleDeleteMessage = async (): Promise<void> => {
        try {
            if (!message._id) throw new Error("Message id is required");

            await axiosInstance.delete(`/message/delete/${message._id}`);

            const newMessageList = messageList.filter((msg) => msg._id !== message._id);
            setMessageList(newMessageList);

            showToast(tChat("CHAT.MESSAGE.DELETED_MESSAGE_SUCCESS"), "success");
        } catch (err) {
            console.log("err: ", err);
            showToast(tChat("CHAT.MESSAGE.DELETED_MESSAGE_FAILED"), "error");
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

            showToast(tChat("CHAT.MESSAGE.RETRACTED_MESSAGE_SUCCESS"), "success");
        } catch (err) {
            console.log("err: ", err);
            showToast(tChat("CHAT.MESSAGE.RETRACTED_MESSAGE_FAILED"), "error");
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
            <Dropdown placement="bottom">
                <DropdownTrigger>{children}</DropdownTrigger>
                <DropdownMenu aria-label="Profile Actions" variant="flat">
                    <DropdownSection aria-label="info" showDivider={isOwnMessage && !message?.isRetracted}>
                        <DropdownItem
                            textValue=""
                            startContent={<CopyIcon size={16} />}
                            key="copy"
                            onPress={() => copy(message.content)}
                        >
                            {tChat("CHAT.MESSAGE_MENU.COPY")}
                        </DropdownItem>
                        <>
                            {!message?.isRetracted && (
                                <DropdownItem
                                    aria-label="pin"
                                    textValue=""
                                    startContent={<PinIcon size={16} />}
                                    key="pin"
                                >
                                    {tChat("CHAT.MESSAGE_MENU.PIN")}
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
                                {tChat("CHAT.MESSAGE_MENU.DELETE")}
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
                                {tChat("CHAT.MESSAGE_MENU.RETRACT")}
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
