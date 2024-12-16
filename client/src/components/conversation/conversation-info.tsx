"use client";
import { Accordion, AccordionItem, Avatar, Button, Listbox, ListboxItem } from "@nextui-org/react";
import { TrashIcon, PaletteIcon, SearchIcon, ThumbsUpIcon, UserIcon } from "lucide-react";
import UserName from "../user/user-name";
import Link from "next/link";
import Image from "next/image";

export default function ConversationInfo() {
    const defaultContent =
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
    return (
        <div id="conversation-info" className="h-screen overflow-auto border-l-1 border-divider p-4 scrollbar">
            <section className="flex flex-col items-center">
                <div>
                    <Avatar
                        isBordered
                        classNames={{
                            base: "!w-24 !h-24 ring-offset-4",
                        }}
                        radius="full"
                        src="https://i.pravatar.cc/150?u=a04258a2462d826712d"
                    />
                    <UserName className="justify-center mt-2 text-lg" />
                </div>

                <div className="flex gap-4 mt-4">
                    <Button
                        as={Link}
                        href="/profile"
                        variant="flat"
                        radius="full"
                        startContent={<UserIcon size={18} className="text-default-500" />}
                        className="text-default-500"
                    >
                        Profile
                    </Button>
                    <Button
                        variant="flat"
                        radius="full"
                        startContent={<SearchIcon size={18} className="text-default-500" />}
                        className="text-default-500"
                    >
                        Search
                    </Button>
                    {/* <Button variant="flat" radius="full" isIconOnly>
                        <SearchIcon size={18} />
                    </Button> */}
                </div>
            </section>

            <section className="mt-4">
                <div>
                    <Accordion
                        selectionMode="multiple"
                        showDivider={false}
                        itemClasses={{
                            base: "py-0 mb-2 w-full",
                            title: "font-normal text-medium",
                            trigger: "px-2 py-0  data-[hover=true]:bg-default-100 rounded-lg h-11 flex items-center ",
                            indicator: "text-medium",
                            content: "text-small p-0",
                        }}
                        defaultExpandedKeys={["1"]}
                    >
                        <AccordionItem key="1" aria-label="Accordion 2" title="Media files">
                            <div className="p-2">
                                <div className="grid grid-cols-12 gap-2 mb-2">
                                    {Array.from({ length: 6 }).map(
                                        (
                                            _,
                                            index // 6 is the number of media files to display
                                        ) => (
                                            <div className="col-span-4" key={index}>
                                                <Image
                                                    className="rounded-lg"
                                                    width={100}
                                                    height={100}
                                                    src={`https://picsum.photos/id/${index + 88}/367/267`}
                                                    alt="media"
                                                />
                                            </div>
                                        )
                                    )}
                                </div>
                                <Button fullWidth variant="flat">
                                    View all media files
                                </Button>
                            </div>
                        </AccordionItem>
                        <AccordionItem key="2" aria-label="Accordion 1" title="Conversation settings">
                            <div>
                                <Listbox variant="flat" className="p-0 pb-1 text-default-700">
                                    <ListboxItem key="new" startContent={<PaletteIcon size={18} />}>
                                        Change theme
                                    </ListboxItem>
                                    <ListboxItem key="copy" startContent={<ThumbsUpIcon size={18} />}>
                                        Change emoji icon
                                    </ListboxItem>
                                </Listbox>
                            </div>
                        </AccordionItem>
                        <AccordionItem key="3" aria-label="Accordion 3" title="Security">
                            <div>
                                <Listbox variant="flat" className="p-0 pb-1 text-default-700">
                                    <ListboxItem
                                        color="danger"
                                        className="text-danger"
                                        key="delete"
                                        startContent={<TrashIcon size={18} />}
                                    >
                                        Delete conversation
                                    </ListboxItem>
                                </Listbox>
                            </div>
                        </AccordionItem>
                    </Accordion>
                </div>
            </section>
        </div>
    );
}
