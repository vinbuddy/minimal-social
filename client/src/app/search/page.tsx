"use client";
import MainLayout from "@/components/MainLayout";
import UserSuggestionList from "@/components/User/UserSuggetionList";

import { Input } from "@nextui-org/react";
import { Search } from "lucide-react";

export default function SearchPage() {
    return (
        <MainLayout>
            <div className="flex justify-center w-full">
                <div className="w-[630px]">
                    <header className="sticky top-0 z-10 p-4 bg-background">
                        <Input
                            isClearable
                            classNames={{
                                base: "w-full",
                                inputWrapper: "h-[2.8rem] px-4",
                            }}
                            defaultValue={""}
                            placeholder="Search..."
                            size="md"
                            variant="flat"
                            radius="full"
                            startContent={<Search className="text-default-400 me-1" size={18} />}
                            type="text"
                        />
                    </header>

                    <main className="px-4 pb-4">
                        <UserSuggestionList />
                    </main>
                </div>
            </div>
        </MainLayout>
    );
}
