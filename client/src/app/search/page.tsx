import MainLayout from "@/components/MainLayout";
import { Input } from "@nextui-org/react";
import { Search } from "lucide-react";

export default function SearchPage() {
    return (
        <MainLayout>
            <div className="flex justify-center w-full">
                <div className="w-[630px]">
                    <header className="sticky top-0 z-10 p-4 flex justify-center items-center bg-background">
                        <Input
                            isClearable
                            classNames={{
                                base: "w-full",
                                // inputWrapper:
                                //     "border-2 border-transparent hover:!border-divider focus-within:!border-divider",
                            }}
                            defaultValue={""}
                            placeholder="Search..."
                            size="lg"
                            variant="flat"
                            radius="lg"
                            startContent={<Search className="text-default-400" size={18} />}
                            type="text"
                        />
                    </header>

                    <main className="px-4 pb-4"></main>
                </div>
            </div>
        </MainLayout>
    );
}
