"use client";

import { usePathname, useRouter } from "next/navigation";
import { BanIcon, LanguagesIcon, LockIcon } from "lucide-react";
import { Button } from "@heroui/react";
import cn from "classnames";

import BackButton from "../components/back-button";
import Link from "next/link";
import { useAuthStore } from "@/hooks/store";
import { useTranslation } from "react-i18next";

interface IProps {
    children: React.ReactNode;
}

export default function SettingLayout({ children }: IProps) {
    const pathName = usePathname();
    const router = useRouter();
    const { currentUser } = useAuthStore();
    const { t: tUser } = useTranslation("user");
    const navLinks = [
        {
            content: tUser("USER.SETTING.ACCOUNT"),
            href: "/setting/account",
            icon: <LockIcon size={16} />,
        },
        {
            content: tUser("USER.SETTING.BLOCKED_USER"),
            href: "/setting/blocked",
            icon: <BanIcon size={16} />,
        },
        {
            content: tUser("USER.SETTING.LANGUAGE"),
            href: "/setting/language",
            icon: <LanguagesIcon size={16} />,
        },
    ];

    return (
        <div className="contain-none md:container">
            <div className="grid grid-cols-12 gap-5">
                <div className="col-span-4 md:col-span-3">
                    <aside className="h-screen flex flex-col sticky top-0 z-[1] p-5 overflow-y-auto scrollbar border-r border-default">
                        <div className="flex items-center gap-4">
                            <BackButton
                                onPress={() => {
                                    router.push(`/profile/${currentUser?._id}`);
                                }}
                            />
                            <span className="text-lg">{tUser("USER.SETTING.TITLE")}</span>
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
                                            href={link.href}
                                            as={Link}
                                        >
                                            {link.content}
                                        </Button>
                                    </li>
                                );
                            })}
                        </ul>
                    </aside>
                </div>

                <main className="col-span-8 md:col-span-9 p-5">{children}</main>
            </div>
        </div>
    );
}
