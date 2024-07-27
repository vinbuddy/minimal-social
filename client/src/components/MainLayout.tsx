"use client";
import * as React from "react";
import { LogOut, MoonIcon, SunDim, User } from "lucide-react";
import Link from "next/link";
import { Avatar, Badge, Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/react";
import useAuthStore from "@/hooks/store/useAuthStore";
import axiosInstance from "@/utils/httpRequest";
import useLoading from "@/hooks/useLoading";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";
import { HomeIcon, HeartIcon, ConversationIcon, SearchIcon } from "@/assets/icons";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useSocketContext } from "@/contexts/SocketContext";
import Image from "next/image";

import logoDark from "@/assets/images/logo-dark.png";
import logoLight from "@/assets/images/logo-light.png";
import NotificationToast from "@/components/Notification/NotificationToast";

const navLinks = [
    {
        content: "Home",
        href: "/",
        icon: (isFilled: boolean = false) => <HomeIcon isFilled={isFilled} />,
    },
    {
        content: "Conversation",
        href: "/conversation",
        icon: (isFilled: boolean = false) => <ConversationIcon isFilled={isFilled} />,
    },
    {
        content: "search",
        href: "/search",
        icon: (isFilled: boolean = false) => <SearchIcon isFilled={isFilled} />,
    },
    {
        content: "Notification",
        href: "/notification",
        icon: (isFilled: boolean = false) => <HeartIcon isFilled={isFilled} />,
    },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState<boolean>(false);
    const [isNotification, setIsNotification] = useState<boolean>(false);
    const { theme, setTheme } = useTheme();
    const { currentUser } = useAuthStore();
    const { startLoading, stopLoading, loading } = useLoading();
    const router = useRouter();
    const pathName = usePathname();
    const { socket } = useSocketContext();

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!socket) return;

        socket.on("notification", (data) => {
            console.log(data);
            if (data) {
                setIsNotification(true);
                toast(
                    <div>
                        <NotificationToast sender={data?.sender} notification={data?.notification} />
                    </div>,
                    {
                        closeButton: true,
                    }
                );
            }
        });
    }, [socket]);

    useEffect(() => {
        if (currentUser) setIsNotification(currentUser?.isNotification ?? false);
    }, [currentUser]);

    const handleLogOut = async (): Promise<void> => {
        try {
            startLoading();

            const response = await axiosInstance.post("/auth/logout");

            if (response.status === 200) {
                useAuthStore.setState({
                    currentUser: null,
                    isAuthenticated: false,
                    accessToken: undefined,
                    refreshToken: undefined,
                });

                router.push("/login");

                toast.success("Log out successfully", {
                    position: "bottom-center",
                });
            }
        } catch (error: any) {
            toast.error(error.message, {
                position: "bottom-center",
            });
        } finally {
            stopLoading();
        }
    };

    return (
        <div className="flex w-full bg-muted/40">
            <aside className="w-[80px] fixed top-0 left-0 bottom-0 flex flex-col justify-between h-full border-r-1 border-divider bg-background">
                <nav className="flex flex-col items-center px-4 sm:py-4">
                    <header className="h-[40px] flex items-center mb-5">
                        <Link
                            href="#"
                            className="max-w-full group flex  shrink-0 items-center justify-center gap-2 rounded-full text-lg font-semibold  md:text-base"
                        >
                            {/* <Smile className="h-7 w-7 transition-all group-hover:scale-110" />
                            <span className="sr-only">Acme Inc</span> */}
                            <Image
                                className="rounded-lg max-w-full"
                                src={theme === "light" ? logoLight : logoDark}
                                width={0}
                                height={0}
                                sizes="100vw"
                                style={{ width: "100%", height: "auto" }}
                                alt="logo"
                            />
                        </Link>
                    </header>
                </nav>
                <nav className="">
                    <div className="flex flex-col items-center gap-4">
                        {navLinks.map((navLink, index) => {
                            let isActive = pathName === navLink.href;
                            const Icon = navLink.icon(isActive);
                            const activeColor = theme === "light" ? "text-black" : "text-white";

                            if (isNotification && navLink.href === "/notification") {
                                return (
                                    <Button
                                        key={index}
                                        size="lg"
                                        title={navLink.content}
                                        as={Link}
                                        href={navLink.href}
                                        radius="sm"
                                        isIconOnly
                                        color="default"
                                        className={`${isActive ? activeColor : "text-default-400"}`}
                                        variant="light"
                                    >
                                        <Badge content="" color="danger" shape="circle" placement="top-right">
                                            {Icon}
                                        </Badge>
                                    </Button>
                                );
                            }

                            return (
                                <Button
                                    key={index}
                                    size="lg"
                                    title={navLink.content}
                                    as={Link}
                                    href={navLink.href}
                                    radius="sm"
                                    isIconOnly
                                    // color="danger"
                                    color="default"
                                    className={`${isActive ? activeColor : "text-default-400"}`}
                                    variant="light"
                                >
                                    {Icon}
                                </Button>
                            );
                        })}
                    </div>
                </nav>
                <nav className="flex flex-col items-center gap-4 px-2 sm:py-4">
                    <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                            <Avatar
                                isBordered
                                as="button"
                                className="transition-transform"
                                color="default"
                                size="sm"
                                src={currentUser?.photo}
                            />
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Profile Actions" variant="flat">
                            <DropdownItem textValue="" key="header" className="h-14 gap-2">
                                <p className="font-semibold">Signed in as</p>
                                <p className="font-semibold">{currentUser?.email}</p>
                            </DropdownItem>
                            <DropdownItem
                                textValue=""
                                startContent={<User size={16} />}
                                as={Link}
                                href="/profile"
                                key="profile"
                            >
                                Profile
                            </DropdownItem>
                            <DropdownItem
                                textValue=""
                                isReadOnly
                                startContent={theme === "light" ? <SunDim size={16} /> : <MoonIcon size={16} />}
                                endContent={
                                    <select
                                        className="z-10 outline-none w-16 py-0.5 rounded-md text-tiny group-data-[hover=true]:border-default-500 border-small border-default-300 dark:border-default-200 bg-transparent text-default-500"
                                        id="theme"
                                        name="theme"
                                        value={theme}
                                        onChange={(e) => setTheme(e.target.value)}
                                    >
                                        {mounted && (
                                            <>
                                                <option className="text-black" value="dark">
                                                    Dark
                                                </option>
                                                <option className="text-black" value="light">
                                                    Light
                                                </option>
                                            </>
                                        )}
                                    </select>
                                }
                                key="theme"
                            >
                                Theme
                            </DropdownItem>

                            <DropdownItem
                                textValue=""
                                startContent={<LogOut size={16} />}
                                key="logout"
                                color="danger"
                                className="text-danger"
                                onClick={handleLogOut}
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
