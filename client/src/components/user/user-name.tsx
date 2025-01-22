"use client";
import Link from "next/link";
import { IUser } from "@/types/user";
import { VerifiedIcon } from "@/assets/icons";

import cn from "classnames";

interface IProps extends React.HTMLAttributes<HTMLSpanElement | HTMLAnchorElement> {
    user?: IUser | null;
    isLink?: boolean;
}

function UserName({ user, className, isLink = true }: IProps): React.ReactNode {
    return (
        <>
            {isLink ? (
                <Link
                    href={`/profile/${user?._id}`}
                    className={cn(
                        "flex items-center font-semibold text-foreground hover:text-foreground hover:underline",
                        className
                    )}
                >
                    <span>{user?.username || "Someone"}</span>
                    {user?.isVerified && <VerifiedIcon size={14} className="text-verify ms-1.5" />}
                </Link>
            ) : (
                <span
                    className={cn(
                        "flex items-center font-semibold text-foreground hover:text-foreground hover:underline",
                        className
                    )}
                >
                    <span>{user?.username || "Someone"}</span>
                    {user?.isVerified && <VerifiedIcon size={14} className="text-verify ms-1.5" />}
                </span>
            )}
        </>
    );
}

export default UserName;
