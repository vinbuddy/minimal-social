"use client";
import { useState } from "react";
import { Avatar, Image, Tooltip } from "@heroui/react";
import { EllipsisIcon, WandSparklesIcon } from "lucide-react";
import parse, { domToReact, HTMLReactParserOptions } from "html-react-parser";
import Link from "next/link";

import TimeAgo from "../time-ago";
import MediaFileSlider from "../media/media-file-slider";
import FullScreenMediaSlider from "../media/fullscreen-media-slider";
import UserProfileCard from "../user/user-profile-card";
import PostMenuDropdown from "./post-menu-dropdown";
import UserName from "../user/user-name";
import PostActions from "./post-actions";
import PostModalButton from "./post-modal-button";

import { IPost } from "@/types/post";
import { useVisibility } from "@/hooks";
import { RepostIcon } from "@/assets/icons";

interface IProps {
    post: IPost;
}

export default function PostItem({ post: _post }: IProps) {
    const { isVisible: open, show: showFullscreenSlider, hide: hideFullscreenSlider } = useVisibility();
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [openEditModal, setOpenEditModal] = useState<boolean>(false);

    const isReposted = _post?.originalPost?.caption || _post?.originalPost?.mediaFiles;
    const post: IPost = isReposted ? _post?.originalPost : _post;
    const repostedInfo = _post;

    const handleMediaFileClick = (index: number) => {
        setActiveIndex(index);
        showFullscreenSlider();
    };

    const handleToggleEditModal = () => {
        setOpenEditModal(!openEditModal);
    };

    const convertLinksToAnchors = (content: string) => {
        // Regex URL
        const urlRegex = /(https?:\/\/(?:www\.)?[^\s/$.?#].[^\s]*)/gi;

        // Replace URL -> `<a>`
        return content.replace(
            urlRegex,
            (url) =>
                `<a class="text-link hover:underline font-medium" href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
        );
    };

    // Convert <a> to <Link> tag
    const parserOptions: HTMLReactParserOptions = {
        replace({ attribs, children }: any) {
            if (!attribs) {
                return;
            }

            if (attribs.class === "text-link") {
                return (
                    <Link href={attribs.href} className="text-link hover:underline">
                        {domToReact(children, parserOptions)}
                    </Link>
                );
            }
        },
    };

    return (
        <div className="py-5 border-b border-divider last:border-none">
            <FullScreenMediaSlider
                onHide={hideFullscreenSlider}
                isOpen={open}
                activeSlideIndex={activeIndex}
                mediaFiles={post?.mediaFiles ?? []}
            />
            {isReposted && (
                <div className="flex px-1 mb-5">
                    <section className="flex flex-col items-center">
                        <RepostIcon size={18} />
                        <Avatar
                            isBordered
                            src={post?.postBy?.photo}
                            alt={post?.postBy?.username}
                            size="md"
                            className="cursor-pointer invisible h-0"
                        />
                    </section>
                    <section className="ms-4 flex-1 max-w-full overflow-hidden">
                        <Tooltip
                            delay={500}
                            placement="bottom-start"
                            content={<UserProfileCard user={repostedInfo?.postBy} />}
                        >
                            <div className="flex items-center text-default-600 text-sm gap-2">
                                <Image
                                    radius="full"
                                    className="size-5 z-[1] object-cover"
                                    src={repostedInfo?.postBy?.photo}
                                    alt=""
                                />
                                <div className="flex items-center">
                                    <h4 className="leading-none cursor-pointer hover:underline">
                                        {repostedInfo?.postBy?.username}
                                    </h4>
                                    <span>
                                        &nbsp;reposted <TimeAgo className="!text-sm" date={repostedInfo?.createdAt} />
                                    </span>
                                </div>
                            </div>
                        </Tooltip>
                    </section>
                </div>
            )}
            <div className="flex px-1">
                <section className="flex">
                    <Avatar
                        isBordered
                        src={post?.postBy?.photo}
                        alt={post?.postBy?.username}
                        size="md"
                        className="cursor-pointer"
                    />
                </section>
                <section className="ms-4 flex-1 max-w-full overflow-hidden">
                    <div className="flex items-start justify-between">
                        <Tooltip delay={500} placement="bottom-start" content={<UserProfileCard user={post?.postBy} />}>
                            <h4>
                                <UserName className="leading-none" user={post?.postBy} />
                            </h4>
                        </Tooltip>

                        <div className="flex items-center gap-3">
                            {post?.isEdited && (
                                <Tooltip content="This post is edited" placement="bottom" showArrow>
                                    <WandSparklesIcon className="cursor-pointer" size={16} />
                                </Tooltip>
                            )}

                            {/* Time */}
                            <div className="text-grey text-sm cursor-pointer leading-none">
                                <TimeAgo date={post?.createdAt} />
                            </div>

                            {/* Menu */}
                            <div className="flex flex-col justify-center">
                                <PostMenuDropdown onOpenEditModal={handleToggleEditModal} post={post}>
                                    <button className="outline-none rounded-full z-[1]">
                                        <EllipsisIcon size={16} />
                                    </button>
                                </PostMenuDropdown>
                                <PostModalButton
                                    post={post}
                                    open={openEditModal}
                                    setOpen={setOpenEditModal}
                                    actionType="edit"
                                >
                                    <div></div>
                                </PostModalButton>
                            </div>
                        </div>
                    </div>

                    <div className="mt-1">{parse(convertLinksToAnchors(post?.caption) ?? "", parserOptions)}</div>
                    <div>
                        {post?.mediaFiles && (
                            <div className="mt-2">
                                <MediaFileSlider
                                    onMediaFileClick={handleMediaFileClick}
                                    mediaFiles={post?.mediaFiles ?? []}
                                    videoPreview={true}
                                    scrollHorizontally={false}
                                />
                            </div>
                        )}
                    </div>
                    {/* Like, Share, Save,... */}
                    <div className="mt-2">
                        <PostActions post={_post} />
                    </div>
                </section>
            </div>
        </div>
    );
}
