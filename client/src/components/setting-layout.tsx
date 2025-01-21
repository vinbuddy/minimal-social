"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BanIcon, LanguagesIcon, LockIcon } from "lucide-react";
import { Button } from "@heroui/react";
import Image from "next/image";
import { useTheme } from "next-themes";
import cn from "classnames";

import BackButton from "./back-button";

interface IProps {
    children: React.ReactNode;
}

const navLinks = [
    {
        content: "Account",
        href: "/setting/account",
        icon: <LockIcon />,
    },
    {
        content: "Blocked Users",
        href: "/setting/blocked",
        icon: <BanIcon />,
    },
    {
        content: "Languages",
        href: "/setting/languages",
        icon: <LanguagesIcon />,
    },
];

export default function SettingLayout({ children }: IProps) {
    const pathName = usePathname();
    const { theme } = useTheme();

    return (
        <div className="grid grid-cols-12 gap-5">
            <div className="col-span-3">
                <aside className="h-screen flex flex-col sticky top-0 z-[1] p-5 overflow-y-auto scrollbar border-r border-default">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <Link href="/" className="max-w-full flex items-center gap-2 size-[40px]">
                            <Image
                                className="rounded-lg max-w-full"
                                src={theme === "light" ? "/images/logo-light.png" : "/images/logo-dark.png"}
                                width={0}
                                height={0}
                                sizes="100vw"
                                style={{ width: "100%", height: "auto" }}
                                alt="logo"
                            />

                            <span className="text-lg">Setting</span>
                        </Link>
                    </div>
                    <ul className="mt-5">
                        {navLinks.map((link) => {
                            let isActive: boolean = link.href === pathName;
                            return (
                                <li key={link.href} className="mb-2 last:mb-0">
                                    <Button
                                        className={cn("justify-start", {
                                            "text-default-500": !isActive,
                                            "text-primary": isActive,
                                        })}
                                        startContent={link.icon}
                                        fullWidth
                                        variant={isActive ? "flat" : "light"}
                                    >
                                        {link.content}
                                    </Button>
                                </li>
                            );
                        })}
                    </ul>
                </aside>
            </div>

            <main className="col-span-9 p-5">{children}</main>
        </div>
    );
}
