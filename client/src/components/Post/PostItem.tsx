"use client";
import { IPost } from "@/types/post";
import { Avatar, Image, Tooltip } from "@nextui-org/react";
import { EllipsisIcon, WandSparklesIcon } from "lucide-react";
import TimeAgo from "../TimeAgo";
import parse, { domToReact, HTMLReactParserOptions } from "html-react-parser";
import Link from "next/link";
import MediaFileSlider from "../Media/MediaFileSlider";
import { useState } from "react";
import useVisibility from "@/hooks/useVisibility";
import FullScreenMediaSlider from "../Media/FullScreenMediaSlider";
import UserProfileCard from "../User/UserProfileCard";
import PostMenuDropdown from "./PostMenuDropdown";
import UserName from "../User/UserName";
import PostActions from "./PostActions";
import PostModalButton from "./PostModalButton";
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
                                    className="size-5 z-[1]"
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
                            <p className="text-grey text-sm cursor-pointer leading-none">
                                <TimeAgo date={post?.createdAt} />
                            </p>

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
                                    type="edit"
                                >
                                    <div></div>
                                </PostModalButton>
                            </div>
                        </div>
                    </div>

                    <div className="mt-1">{parse(post?.caption ?? "", parserOptions)}</div>
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
