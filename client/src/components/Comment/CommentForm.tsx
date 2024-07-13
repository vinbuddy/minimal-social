"use client";
import { Avatar, Button } from "@nextui-org/react";
import { useRef, useState } from "react";
import RichTextEditor from "@/components/RichTextEditor";
import useAuthStore from "@/hooks/store/useAuthStore";
import EmojiPicker from "../EmojiPicker";
import { SendHorizontalIcon, SmileIcon } from "lucide-react";

export default function CommentForm() {
    const { currentUser } = useAuthStore();

    const [comment, setComment] = useState<string>("");
    const commentInputRef = useRef<HTMLDivElement>(null);
    return (
        <form className="flex items-end">
            <Avatar size="sm" src={currentUser?.photo} className="!size-[40px]" />

            <div className="min-h-[40px] p-2 px-3 flex-1 flex items-end ms-3 bg-content2 border border-divider rounded-xl">
                {/* Content input */}
                <RichTextEditor
                    isMention={true}
                    isTag={true}
                    ref={commentInputRef}
                    handleInputChange={(value) => {
                        setComment(value);
                    }}
                    className="leading-[1.6] flex-1"
                    placeholder="Type your comment..."
                />

                <EmojiPicker
                    placement="top"
                    contentRef={commentInputRef}
                    onAfterPicked={() => {
                        if (commentInputRef.current) setComment(commentInputRef.current?.innerHTML);
                    }}
                    button={
                        <button className="outline-none">
                            <SmileIcon className="text-muted-foreground" size={18} />
                        </button>
                    }
                />
            </div>
            <Button size="sm" variant="flat" className="bg-transparent !size-[40px]" disableRipple>
                <SendHorizontalIcon size={20} />
            </Button>
        </form>
    );
}
