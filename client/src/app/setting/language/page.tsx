"use client";

import { LANGUAGE_OPTIONS } from "@/constants/language";
import { Listbox, ListboxItem } from "@heroui/react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export default function LanguagePage() {
    const { i18n } = useTranslation();
    const [selectedKeys, setSelectedKeys] = useState(new Set([i18n.language]));

    const selectedValue = useMemo(() => Array.from(selectedKeys).join(", "), [selectedKeys]);

    useEffect(() => {
        if (selectedValue === i18n.language) return;

        i18n.changeLanguage(selectedValue).catch((error) => {
            console.error("Error changing language:", error);
        });
    }, [selectedValue, i18n]);

    return (
        <div>
            <h1 className="text-xl font-medium mb-5">Language setting</h1>
            <div className="w-2/3">
                <Listbox
                    disallowEmptySelection
                    aria-label="Single selection example"
                    selectedKeys={selectedKeys}
                    selectionMode="single"
                    variant="flat"
                    onSelectionChange={(keys) => {
                        setSelectedKeys(new Set(keys as Iterable<string>));
                    }}
                >
                    {LANGUAGE_OPTIONS.map((option) => (
                        <ListboxItem key={option.value}>
                            <div key={option.value} className="flex items-center gap-4 cursor-pointer">
                                <Image
                                    width={40}
                                    height={40}
                                    src={option.flag}
                                    alt={option.label}
                                    className="w-10 rounded-md"
                                />
                                <span>{option.label}</span>
                            </div>
                        </ListboxItem>
                    ))}
                </Listbox>
            </div>
        </div>
    );
}
