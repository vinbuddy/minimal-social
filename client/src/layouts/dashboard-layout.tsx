"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Accordion, AccordionItem, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, User } from "@heroui/react";
import Link from "next/link";

import { useAuthStore } from "@/hooks/store";
import { INavLink } from "@/types/common";
import {
    BarChart3Icon,
    LayoutPanelLeftIcon,
    LogOutIcon,
    MessageSquareWarningIcon,
    MoonIcon,
    SunDim,
    UserIcon,
    UsersIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import cn from "classnames";
import Image from "next/image";

const navLinks: INavLink[] = [
    {
        content: "Dashboard",
        href: "/admin",
        icon: <LayoutPanelLeftIcon size={20} />,
    },
    {
        content: "Users",
        href: "/admin/user",
        icon: <UsersIcon size={20} />,
    },
    {
        content: "Reports",
        href: "/admin/user",
        icon: <MessageSquareWarningIcon size={20} />,
    },
    {
        content: "Analytics",
        href: "/admin/user",
        icon: <BarChart3Icon size={20} />,
    },
    // {
    //     content: "Sản phẩm",
    //     href: "/admin/product",
    //     icon: <FiShoppingBag />,
    //     children: [
    //         {
    //             content: "Sản phẩm",
    //             href: "/admin/product",
    //             icon: <FiShoppingBag />,
    //         },
    //         {
    //             content: "Danh mục",
    //             href: "/admin/category",
    //             icon: <TbCategoryPlus />,
    //         },
    //         {
    //             content: "Size",
    //             href: "/admin/size",
    //             icon: <RxSize />,
    //         },
    //         {
    //             content: "Topping",
    //             href: "/admin/topping",
    //             icon: <LuIceCream2 />,
    //         },
    //     ],
    // },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { currentUser } = useAuthStore();
    const router = useRouter();
    const pathName = usePathname();
    const { theme, setTheme } = useTheme();

    const [mounted, setMounted] = useState<boolean>(false);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!currentUser || !currentUser?.isAdmin) {
            router.push("/admin/login");
        }
    }, [currentUser, router]);

    const renderSubNavLink = (currentNav: INavLink, subNavs: INavLink[]): React.ReactNode => {
        return (
            <Accordion variant="light" showDivider={false} itemClasses={{ trigger: "py-4", title: "text-base" }}>
                <AccordionItem startContent={currentNav.icon} title={currentNav.content}>
                    {subNavs.map((navLink, index) => {
                        let isActive: boolean = navLink.href === pathName;

                        return (
                            <li key={index} className={`${isActive && "bg-[#E4E4E7] shadow"} rounded-lg  mb-3`}>
                                <Link className="flex items-center ps-4 py-2" href={navLink.href}>
                                    {navLink.icon}
                                    <span className="ms-2.5">{navLink.content}</span>
                                </Link>
                            </li>
                        );
                    })}
                </AccordionItem>
            </Accordion>
        );
    };

    if (!mounted) return null;

    return (
        <div className="min-h-[400px]">
            <div className="grid grid-cols-12 gap-5 h-full">
                <section className="col-span-6 sm:col-span-6 md:col-span-3 lg:col-span-3 xl:col-span-2 2xl:col-span-2">
                    <aside className="h-screen flex flex-col justify-between sticky top-0 z-[1] p-3 overflow-y-auto scrollbar border-r border-default">
                        <div>
                            <header className="size-[50px] flex items-center mb-5">
                                <Link
                                    href="/admin"
                                    className="max-w-full group flex  shrink-0 items-center justify-center gap-2 rounded-full text-lg font-semibold  md:text-base"
                                >
                                    <Image
                                        className="rounded-lg max-w-full"
                                        src={theme === "light" ? "/images/logo-light.png" : "/images/logo-dark.png"}
                                        width={0}
                                        height={0}
                                        sizes="100vw"
                                        style={{ width: "100%", height: "auto" }}
                                        alt="logo"
                                    />
                                </Link>
                            </header>
                            <ul className="mt-5">
                                {navLinks.map((navLink, index) => {
                                    let isActive: boolean = navLink.href === pathName;
                                    if (navLink?.children) {
                                        return renderSubNavLink(navLink, navLink.children);
                                    }

                                    return (
                                        <li
                                            key={navLink.href}
                                            className={cn("rounded-xl text-default-600 hover:text-primary", {
                                                "bg-content3 text-primary": isActive,
                                            })}
                                        >
                                            <Link className="flex items-center p-3 " href={navLink.href}>
                                                {navLink.icon}
                                                <span className="ms-2.5">{navLink.content}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        <div className="mt-5 bg-content2 rounded-xl p-3">
                            <Dropdown placement="bottom-end">
                                <DropdownTrigger>
                                    <div className="w-full h-full cursor-pointer">
                                        <User
                                            className="h-full cursor-pointer"
                                            classNames={{
                                                name: "text-base",
                                                description: "text-xs text-default-500",
                                            }}
                                            avatarProps={{
                                                src: currentUser?.photo,
                                                isBordered: true,
                                                size: "sm",
                                            }}
                                            name={currentUser?.username}
                                            description="Admin"
                                        />
                                    </div>
                                </DropdownTrigger>
                                <DropdownMenu aria-label="Profile Actions" variant="flat">
                                    <DropdownItem textValue="" key="header" className="h-14 gap-2">
                                        <p className="font-semibold">Signed in as</p>
                                        <p className="font-semibold">{currentUser?.email}</p>
                                    </DropdownItem>
                                    <DropdownItem
                                        textValue=""
                                        startContent={<UserIcon size={16} />}
                                        as={Link}
                                        href={`/profile/${currentUser?._id}`}
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
                                        startContent={<LogOutIcon size={16} />}
                                        key="logout"
                                        color="danger"
                                        className="text-danger"
                                        //    onPress={handleLogOut}
                                    >
                                        Log out
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    </aside>
                </section>
                <section className="col-span-6 sm:col-span-6 md:col-span-9 lg:col-span-9 xl:col-span-10 2xl:col-span-10">
                    <div className="p-5">{children}</div>
                </section>
            </div>
        </div>
    );
}
