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
import { useAuthStore } from "@/hooks/store";

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
    const { currentUser } = useAuthStore();
    const handleCopy = async (): Promise<void> => {
        try {
            await navigator.clipboard.writeText(message.content);
            showToast("Copied comment", "success");
        } catch (err) {
            showToast("Copy comment failed", "error");
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
                onOk={async () => {}}
                onClose={onCloseDelete}
            />
            <ConfirmationModal
                title="Retract this message ?"
                description="This message will be deleted for everyone"
                icon={<RotateCcwIcon size={24} />}
                isOpen={isOpenRetract}
                onOpenChange={onOpenRetract}
                onOk={async () => {}}
                onClose={onCloseRetract}
            />
            <Dropdown placement="bottom">
                <DropdownTrigger>{children}</DropdownTrigger>
                <DropdownMenu aria-label="Profile Actions" variant="flat">
                    <DropdownSection showDivider={message?.sender?._id === currentUser?._id}>
                        <DropdownItem textValue="" startContent={<InfoIcon size={16} />} key="view">
                            View detail
                        </DropdownItem>
                        <DropdownItem
                            textValue=""
                            startContent={<CopyIcon size={16} />}
                            key="copy"
                            onClick={handleCopy}
                        >
                            Copy message
                        </DropdownItem>
                        <DropdownItem textValue="" startContent={<PinIcon size={16} />} key="copy">
                            Pin message
                        </DropdownItem>
                    </DropdownSection>
                    {message?.sender?._id === currentUser?._id ? (
                        <>
                            <DropdownItem
                                textValue=""
                                startContent={<Trash2Icon size={16} />}
                                key="delete"
                                color="danger"
                                className="text-danger"
                                onClick={onOpenChangeDelete}
                            >
                                Delete message
                            </DropdownItem>
                            <DropdownItem
                                textValue=""
                                startContent={<RotateCcwIcon size={16} />}
                                key="delete"
                                color="danger"
                                className="text-danger"
                                onClick={onOpenChangeRetract}
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
