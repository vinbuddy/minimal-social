"use client";
import { IPost } from "@/types/post";
import { Avatar, Button, Tooltip } from "@nextui-org/react";
import { EllipsisIcon, WandSparklesIcon } from "lucide-react";
import TimeAgo from "../TimeAgo";
import parse, { domToReact, HTMLReactParserOptions } from "html-react-parser";
import Link from "next/link";
import MediaFileSlider from "../Media/MediaFileSlider";
import { useState } from "react";
import useVisibility from "@/hooks/useVisibility";
import FullScreenMediaSlider from "../Media/FullScreenMediaSlider";

interface IProps {
    post: IPost;
}

export default function PostItem({ post }: IProps) {
    const { isVisible: open, show: showFullscreenSlider, hide: hideFullscreenSlider } = useVisibility();
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const handleMediaFileClick = (index: number) => {
        setActiveIndex(index);
        showFullscreenSlider();
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
        <div className="py-5 border-b last:border-none">
            <FullScreenMediaSlider
                onHide={hideFullscreenSlider}
                isOpen={open}
                activeSlideIndex={activeIndex}
                mediaFiles={post?.mediaFiles}
            />
            <div className="flex">
                <section className="flex flex-col ">
                    <Avatar
                        src={post?.postBy?.photo}
                        alt={post?.postBy?.username}
                        size="md"
                        className="cursor-pointer"
                    />
                </section>
                <section className="ms-4 flex-1 max-w-full overflow-hidden">
                    <div className="flex items-start justify-between">
                        <Tooltip
                            delay={500}
                            placement="bottom"
                            content={
                                <div className="px-1 py-2">
                                    <div className="text-small font-bold">Custom Content</div>
                                    <div className="text-tiny">This is a custom tooltip content</div>
                                </div>
                            }
                        >
                            <h4 className="font-semibold hover:underline cursor-pointer leading-none">
                                {post?.postBy?.username}
                            </h4>
                        </Tooltip>

                        <div className="flex items-center">
                            {post?.isEdited && (
                                <Tooltip content="This post is edited" placement="bottom" showArrow>
                                    <WandSparklesIcon size={18} />
                                </Tooltip>
                            )}

                            {/* Time */}
                            <p className="text-grey text-sm me-3 cursor-pointer leading-none">
                                <TimeAgo date={post?.createdAt} />
                            </p>

                            {/* Menu */}
                            <button className="animation-tap rounded-full tw-hover-effect">
                                <EllipsisIcon size={16} />
                            </button>
                            {/* <Button isIconOnly size="sm" radius="full" color="default" variant="light">
                                <EllipsisIcon size={16} />
                            </Button> */}
                        </div>
                    </div>

                    <div className="mt-1">{parse(post?.caption ?? "", parserOptions)}</div>
                    <div>
                        <MediaFileSlider
                            onMediaFileClick={handleMediaFileClick}
                            mediaFiles={post?.mediaFiles ?? []}
                            videoPreview={true}
                            scrollHorizontally={false}
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}
