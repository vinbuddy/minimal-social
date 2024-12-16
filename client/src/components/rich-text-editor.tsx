"use client";
import { Avatar, Spinner } from "@nextui-org/react";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import parse from "html-react-parser";

import { IUser } from "@/types/user";
import { setCaretAtTheEnd } from "@/utils/editor";
import axiosInstance from "@/utils/httpRequest";
import { useDebounce } from "@/hooks";

interface IProps {
    className?: string;
    isMention?: boolean;
    isTag?: boolean;
    value?: string;
    placeholder?: string;
    handleInputChange: (value: string) => void;
}

function RichTextEditor(
    { value = "", placeholder = "Type something...", isMention = false, isTag, className, handleInputChange }: IProps,
    ref: React.ForwardedRef<HTMLDivElement>
) {
    const [isTypingMention, setIsTypingMention] = useState<boolean>(false);
    const [isTypingTag, setIsTypingTag] = useState<boolean>(false);

    const [mentionLoading, setMentionLoading] = useState<boolean>(false);

    const [suggestions, setSuggestions] = useState<IUser[]>([]);
    const [userName, setUserName] = useState<string>("");

    const dropdownMentionRef = useRef<HTMLDivElement>(null);
    const contentInnerRef = useRef<HTMLDivElement>(null);

    const debouncedSearch = useDebounce(userName, 750);

    const isOpenMention = isTypingMention === true && debouncedSearch.length > 0 && suggestions.length > 0;

    // Using forward ref inside it
    useImperativeHandle(ref, () => contentInnerRef.current!, []);

    // Close mention dropdown after clicked outside
    useEffect(() => {
        const clickOutsideMentions = (event: any) => {
            if (dropdownMentionRef.current && !dropdownMentionRef.current.contains(event.target)) {
                setIsTypingMention(false);
                setSuggestions([]);
            }
        };

        document.addEventListener("click", clickOutsideMentions);

        return () => {
            document.removeEventListener("click", clickOutsideMentions);
        };
    }, []);

    // Call user api when typing mention
    useEffect(() => {
        if (debouncedSearch.trim().length <= 0 && !isTypingMention) {
            setSuggestions([]);
            setIsTypingMention(false);
            return;
        }

        (async function () {
            try {
                setMentionLoading(true);

                const response = await axiosInstance(`/user/search?query=${encodeURIComponent(debouncedSearch)}`);

                // const resData = await res.json();
                setSuggestions(response.data.data);
                setMentionLoading(false);
            } catch (error) {
                setMentionLoading(false);
            }
        })();
    }, [debouncedSearch, isTypingMention]);

    const handleInput = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        const value = e.currentTarget.innerText;

        if (isMention) {
            createMention(value);
        }

        if (isTag) {
            createTag(value);
        }
        handleInputChange(e.currentTarget.innerHTML);
    };

    const createMention = (value: string): void => {
        const lastChar = value.split("")[value.length - 1];

        if (isTypingMention) {
            const words = value.split(" ");
            let v = words[words.length - 1].substring(1);

            const mentionRegex = /@(\w+)/g;
            const tagRegex = /#(\w+)/g;

            // Mention -> Tag
            const mentionText = value.replace(mentionRegex, (match, username) => {
                return `<a href="/profile/${username}" class="text-link">@${username}</a>`;
            });

            const tagText = mentionText.replace(tagRegex, (match, tag) => {
                return `<a href="/search?query=${tag}" class="text-link">#${tag}</a>`;
            });

            // Set the HTML content of contenteditable
            if (contentInnerRef.current) {
                contentInnerRef.current.textContent = tagText;
                const tagTextWithBreaks = tagText.replace(/\n/g, "<br>");

                contentInnerRef.current.innerHTML = tagTextWithBreaks;
                setCaretAtTheEnd(contentInnerRef.current);
            }

            setUserName(v);
        }

        if (lastChar === " " || value === "" || value.includes("&nbsp;")) {
            setIsTypingMention(false);
            setSuggestions([]);
            setUserName("");
        }

        if (lastChar === "@") {
            setIsTypingMention(true);
        }
    };

    const createTag = (value: string): void => {
        const lastChar = value.split("")[value.length - 1];

        if (lastChar === "#") {
            setIsTypingTag(true);
        }

        if (lastChar === " " || value === "" || value.includes("&nbsp;")) {
            setIsTypingTag(false);
        }

        if (isTypingTag) {
            const mentionRegex = /@(\w+)/g;
            const tagRegex = /#(\w+)/g;

            // Tag -> Mention
            const tagText = value.replace(tagRegex, (match, tag) => {
                return `<a href="/search?query=${tag}" class="text-link">#${tag}</a>`;
            });

            const mentionText = tagText.replace(mentionRegex, (match, username) => {
                return `<a href="/profile/${username}" class="text-link">@${username}</a>`;
            });

            // Set the HTML content of contenteditable
            if (contentInnerRef.current) {
                contentInnerRef.current.textContent = mentionText;
                const mentionTextWithBreaks = mentionText.replace(/\n/g, "<br>");

                contentInnerRef.current.innerHTML = mentionTextWithBreaks;
                setCaretAtTheEnd(contentInnerRef.current);
            }
        }
    };

    const renderMentions = (): React.ReactElement => {
        return (
            <div
                ref={dropdownMentionRef}
                className="rounded-lg bg-content1 flex flex-col  max-h-[120px] overflow-auto scrollbar"
            >
                {mentionLoading ? (
                    <Spinner />
                ) : (
                    <>
                        {suggestions.map((user: IUser) => (
                            <div
                                key={user._id}
                                className="hover:bg-content2 transition ease-in px-3 flex items-center gap-3 py-2 cursor-pointer"
                                onClick={() => selectMention(user?.username)}
                            >
                                <Avatar
                                    size="sm"
                                    key={user._id}
                                    onClick={() => selectMention(user?.username)}
                                    src={user?.photo}
                                    alt=""
                                />
                                {user?.username}
                            </div>
                        ))}
                    </>
                )}

                {suggestions.length <= 0 && <p className="text-default-500">Users not found</p>}
            </div>
        );
    };

    const selectMention = (selectedMention: string): void => {
        if (contentInnerRef.current) {
            const text = contentInnerRef.current.innerText;

            const mentionRegex = /@(\w+)$/g;
            const match = mentionRegex.exec(text);

            if (match) {
                const username = match[1];

                // Replace the last mention with a span tag
                const replacedText = text.replace(
                    mentionRegex,
                    `<a href="/profile/${selectedMention}" class="text-link">@${selectedMention}</a>`
                );

                // Update the contenteditable with the replaced text
                contentInnerRef.current.innerHTML = replacedText;
                handleInputChange(replacedText);
            }

            setCaretAtTheEnd(contentInnerRef.current);

            setUserName("");
        }
    };

    return (
        <>
            {isMention ? (
                <>
                    <div className="relative w-full">
                        <div
                            suppressContentEditableWarning={true}
                            ref={contentInnerRef}
                            className={`${className} dark:text-white text-black text-sm input-editor`}
                            aria-placeholder={placeholder}
                            contentEditable={true}
                            onKeyUp={handleInput}
                        >
                            {parse(value)}
                        </div>
                        <div
                            className={`mt-3 w-full overflow-hidden scrollbar border-divider border rounded-lg ${
                                isOpenMention ? "block" : "hidden"
                            }`}
                        >
                            {renderMentions()}
                        </div>
                    </div>
                </>
            ) : (
                <div
                    suppressContentEditableWarning={true}
                    ref={contentInnerRef}
                    className={`${className} text-sm input-editor`}
                    aria-placeholder={placeholder}
                    contentEditable={true}
                    onKeyUp={handleInput}
                >
                    {parse(value)}
                </div>
            )}
        </>
    );
}

export default forwardRef(RichTextEditor);
