"use client";
import Link from "next/link";
import { IUser } from "@/types/user";
import { VerifiedIcon } from "@/assets/icons";

interface IProps {
    user?: IUser | null;
    className?: string;
}

function UserName({ user, className = "" }: IProps): React.ReactNode {
    return (
        <Link
            href={`/profile/${user?._id}`}
            className={`${className} flex items-center font-semibold text-foreground hover:text-foreground hover:underline`}
        >
            <span>{user?.username || "Someone"}</span>
            {user?.isVerified && <VerifiedIcon size={14} className="text-verify ms-1.5" />}
        </Link>
    );
}

export default UserName;
