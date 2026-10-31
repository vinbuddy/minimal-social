"use client";
import Link from "next/link";
import { EllipsisIcon, SendIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import ReelMenuDropdown from "./reel-menu-dropdown";
import { CommentIcon, HeartIcon } from "@/assets/icons";
import { useCopyToClipboard } from "@/hooks";
import { IReel } from "@/types/reel";
import { formatCompactNumber } from "@/utils/reel";

interface IProps {
    reel: IReel;
    isLiked: boolean;
    likeCount: number;
    commentCount: number;
    onToggleLike: () => void;
    onOpenComments: () => void;
    onDeleted?: (reel: IReel) => void;
}

interface IActionProps {
    label: string;
    count?: string;
    children: React.ReactNode;
    onPress?: () => void;
    className?: string;
}

// Outside the video (desktop) the column uses the theme ink; over the video (mobile) it is white
const actionButtonClass =
    "flex items-center justify-center size-10 rounded-full outline-none transition-transform active:scale-90 hover:opacity-70 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2";

function ReelAction({ label, count, children, onPress, className = "" }: IActionProps) {
    return (
        <div className="flex flex-col items-center gap-0.5">
            <button type="button" aria-label={label} title={label} onClick={onPress} className={`${actionButtonClass} ${className}`}>
                {children}
            </button>
            {count !== undefined && <span className="text-tiny font-medium leading-none">{count}</span>}
        </div>
    );
}

export default function ReelActions({
    reel,
    isLiked,
    likeCount,
    commentCount,
    onToggleLike,
    onOpenComments,
    onDeleted,
}: IProps) {
    const copy = useCopyToClipboard();
    const { t: tReel, i18n } = useTranslation("reel");
    const { t } = useTranslation("common");

    return (
        <div className="flex flex-col items-center gap-4">
            <ReelAction
                label={t("LIKE")}
                count={likeCount > 0 ? formatCompactNumber(likeCount, i18n.language) : tReel("REEL_LIKES")}
                onPress={onToggleLike}
                className={isLiked ? "text-danger" : ""}
            >
                <HeartIcon isFilled={isLiked} size={26} />
            </ReelAction>

            <ReelAction
                label={t("COMMENT")}
                count={formatCompactNumber(commentCount, i18n.language)}
                onPress={onOpenComments}
            >
                <CommentIcon size={26} />
            </ReelAction>

            <ReelAction
                label={tReel("REEL_SHARE")}
                onPress={() => copy(`${window.location.origin}/reels/${reel._id}`)}
            >
                <SendIcon size={24} />
            </ReelAction>

            <ReelMenuDropdown reel={reel} onDeleted={onDeleted}>
                <button type="button" aria-label={tReel("REEL_MORE_OPTIONS")} className={actionButtonClass}>
                    <EllipsisIcon size={24} />
                </button>
            </ReelMenuDropdown>

            {reel.audio && (
                <Link
                    href={`/reels/audio/${reel.audio._id}`}
                    title={tReel("REEL_MENU.GO_TO_AUDIO")}
                    className="block size-8 rounded-small overflow-hidden border-2 border-current outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
                >
                    <img src={reel.audio.coverUrl} alt={tReel("AUDIO.TITLE")} className="w-full h-full object-cover" />
                </Link>
            )}
        </div>
    );
}
