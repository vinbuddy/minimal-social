"use client";

import { Dropdown, DropdownMenu, DropdownItem, DropdownTrigger, DropdownSection } from "@nextui-org/react";
import { BanIcon, FlagTriangleRightIcon, LogOutIcon, SettingsIcon, ShareIcon } from "lucide-react";

import { IUser } from "@/types/user";
import { useCopyToClipboard, useIsOwner } from "@/hooks";

interface IProps {
    children: React.ReactNode;
    user: IUser;
}

export default function ProfileMenuDropdown({ children, user }: IProps) {
    const isOwner = useIsOwner(user._id);
    const copy = useCopyToClipboard();

    return (
        <>
            <Dropdown placement="bottom-end">
                <DropdownTrigger>{children}</DropdownTrigger>
                {isOwner ? (
                    <DropdownMenu variant="flat" aria-label="Static Actions">
                        <DropdownSection aria-label="setting" showDivider>
                            <DropdownItem startContent={<SettingsIcon size={16} />} key="setting">
                                Settings
                            </DropdownItem>
                            <DropdownItem
                                startContent={<ShareIcon size={16} />}
                                key="share"
                                onPress={() => copy(`${window.location.origin}/user/${user.username}`)}
                            >
                                Share profile link
                            </DropdownItem>
                        </DropdownSection>
                        <DropdownItem
                            color="danger"
                            className="text-danger"
                            startContent={<LogOutIcon size={16} />}
                            key="logout"
                        >
                            Logout
                        </DropdownItem>
                    </DropdownMenu>
                ) : (
                    <DropdownMenu variant="flat" aria-label="Static Actions">
                        <DropdownSection aria-label="user" showDivider>
                            <DropdownItem
                                startContent={<ShareIcon size={16} />}
                                key="share"
                                onPress={() => copy(`${window.location.origin}/user/${user.username}`)}
                            >
                                Share profile link
                            </DropdownItem>
                        </DropdownSection>
                        <DropdownItem
                            color="danger"
                            className="text-danger"
                            startContent={<BanIcon size={16} />}
                            key="block"
                        >
                            Block user
                        </DropdownItem>
                        <DropdownItem
                            color="danger"
                            className="text-danger"
                            startContent={<FlagTriangleRightIcon size={16} />}
                            key="report"
                        >
                            Report user
                        </DropdownItem>
                    </DropdownMenu>
                )}
            </Dropdown>
        </>
    );
}
