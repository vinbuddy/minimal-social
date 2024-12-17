"use client";

import { Tab, Tabs } from "@nextui-org/react";
import Image from "next/image";

export default function ConversationStorage() {
    return (
        <div>
            <div className="sticky top-[76px] bg-content1 pb-4">
                <Tabs fullWidth size="md">
                    <Tab key="media" title="Media files" />
                    <Tab key="file" title="Files" />
                    <Tab key="link" title="Links" />
                </Tabs>
            </div>

            <div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                    {Array.from({ length: 100 }).map(
                        (
                            _,
                            index // 6 is the number of media files to display
                        ) => (
                            <Image
                                key={index}
                                className="rounded-lg"
                                width={100}
                                height={100}
                                src={`https://picsum.photos/id/${index + 88}/367/267`}
                                alt="media"
                            />
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
