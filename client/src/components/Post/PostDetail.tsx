"use client";

import useVisibility from "@/hooks/useVisibility";
import { IPost } from "@/types/post";
import { Avatar, Button, Tooltip } from "@nextui-org/react";
import { useState } from "react";
import UserName from "../User/UserName";
import UserProfileCard from "../User/UserProfileCard";
import { EllipsisIcon, WandSparklesIcon } from "lucide-react";
import TimeAgo from "../TimeAgo";
import PostMenuDropdown from "./PostMenuDropdown";
import PostModalButton from "./PostModalButton";
import parse, { domToReact, HTMLReactParserOptions } from "html-react-parser";
import Link from "next/link";
import MediaFileSlider from "../Media/MediaFileSlider";
import PostActions from "./PostActions";
import FullScreenMediaSlider from "../Media/FullScreenMediaSlider";
import PostActivitiesModalButton from "./PostActivitiesModalButton";

interface IProps {
    post: IPost;
}

export default function PostDetail({ post }: IProps) {
    const { isVisible: open, show: showFullscreenSlider, hide: hideFullscreenSlider } = useVisibility();
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [openEditModal, setOpenEditModal] = useState<boolean>(false);
    const handleMediaFileClick = (index: number) => {
        setActiveIndex(index);
        showFullscreenSlider();
    };

    const handleToggleEditModal = () => {
        setOpenEditModal(!openEditModal);
    };

    // Convert <a> to <Link> tag
    const parserOptions: HTMLReactParserOptions = {
        replace({ attribs, children }: any) {
            if (!attribs) {
                return;
            }

            if (attribs.class === "text-link") {
                return (
                    <Link href={attribs.href} className="text-link">
                        {domToReact(children, parserOptions)}
                    </Link>
                );
            }
        },
    };

    return (
        <div>
            <FullScreenMediaSlider
                onHide={hideFullscreenSlider}
                isOpen={open}
                activeSlideIndex={activeIndex}
                mediaFiles={post?.mediaFiles}
            />
            <section className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Avatar
                        isBordered
                        src={post?.postBy?.photo}
                        alt={post?.postBy?.username}
                        size="md"
                        className="cursor-pointer"
                    />
                    <Tooltip delay={500} placement="bottom-start" content={<UserProfileCard user={post?.postBy} />}>
                        <h4>
                            <UserName className="leading-none" user={post?.postBy} />
                        </h4>
                    </Tooltip>
                </div>

                <div className="flex items-center gap-3">
                    {post?.isEdited && (
                        <Tooltip content="This post is edited" placement="bottom" showArrow>
                            <WandSparklesIcon className="cursor-pointer" size={16} />
                        </Tooltip>
                    )}

                    {/* Time */}
                    <p className="text-grey cursor-pointer">
                        <TimeAgo date={post?.createdAt} />
                    </p>

                    {/* Menu */}
                    <div className="flex flex-col justify-center">
                        <PostMenuDropdown onOpenEditModal={handleToggleEditModal} post={post}>
                            <button className="outline-none rounded-full z-[1]">
                                <EllipsisIcon size={16} />
                            </button>
                        </PostMenuDropdown>
                        <PostModalButton post={post} open={openEditModal} setOpen={setOpenEditModal} type="edit">
                            <div></div>
                        </PostModalButton>
                    </div>
                </div>
            </section>
            <section className="mt-4">
                <div className="block">{parse(post?.caption ?? "", parserOptions)}</div>
                <MediaFileSlider
                    onMediaFileClick={handleMediaFileClick}
                    mediaFiles={post?.mediaFiles ?? []}
                    videoPreview={true}
                    scrollHorizontally={false}
                />
                {/* Like, Share, Save,... */}
                <div className="mt-2 flex items-center justify-between">
                    <PostActions post={post} />

                    <PostActivitiesModalButton
                        buttonProps={{
                            size: "sm",
                            variant: "light",
                            radius: "full",
                            className: "text-default-500 text-sm px-3 cursor-pointer",
                            children: "See activities",
                        }}
                    />
                </div>
            </section>
        </div>
    );
}
