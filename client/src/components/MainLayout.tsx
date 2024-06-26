"use client";
import * as React from "react";
import { LogOut, Send, Smile, Sun, SunDim, User, UsersRound } from "lucide-react";
import Link from "next/link";
import {
    Avatar,
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Switch,
    Tooltip,
} from "@nextui-org/react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen w-full bg-muted/40">
            <aside className="flex flex-col h-screen border-r-1 border-divider bg-background">
                <nav className="flex flex-col items-center px-4 sm:py-4">
                    <header className="h-[40px] flex items-center mb-5">
                        <Link
                            href="#"
                            className=" group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full text-lg font-semibold md:h-8 md:w-8 md:text-base"
                        >
                            <Smile className="h-7 w-7 transition-all group-hover:scale-110" />
                            <span className="sr-only">Acme Inc</span>
                        </Link>
                    </header>
                    <div className="flex flex-col items-center gap-3">
                        <Tooltip showArrow color="default" content="Messages" placement="right">
                            <Button isIconOnly color="primary">
                                <Send />
                            </Button>
                        </Tooltip>
                        <Tooltip showArrow color="default" content="Users" placement="right">
                            <Button isIconOnly color="default" variant="light">
                                <UsersRound />
                            </Button>
                        </Tooltip>
                    </div>
                </nav>
                <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-4">
                    <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                            <Avatar
                                isBordered
                                as="button"
                                className="transition-transform"
                                color="default"
                                size="sm"
                                src="https://ui.shadcn.com/avatars/02.png"
                            />
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Profile Actions" variant="flat">
                            <DropdownItem startContent={<User size={16} />} as={Link} href="/profile" key="profile">
                                Profile
                            </DropdownItem>
                            <DropdownItem
                                isReadOnly
                                startContent={<SunDim size={16} />}
                                endContent={
                                    <select
                                        className="z-10 outline-none w-16 py-0.5 rounded-md text-tiny group-data-[hover=true]:border-default-500 border-small border-default-300 dark:border-default-200 bg-transparent text-default-500"
                                        id="theme"
                                        name="theme"
                                    >
                                        <option className="text-black">Light</option>
                                        <option className="text-black">Dark</option>
                                    </select>
                                }
                                key="theme"
                            >
                                Theme
                            </DropdownItem>

                            <DropdownItem
                                startContent={<LogOut size={16} />}
                                key="logout"
                                color="danger"
                                className="text-danger"
                                // onClick={handleSignOut}
                            >
                                Log out
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </nav>
            </aside>

            <div className="flex-1">
                <div>{children}</div>
            </div>
        </div>
    );
}
