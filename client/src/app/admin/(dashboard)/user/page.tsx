"use client";

import { IUser } from "@/types/user";
import {
    Chip,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tooltip,
    User,
} from "@heroui/react";
import { BanIcon, CopyIcon, DeleteIcon, EditIcon, EyeIcon, UserRoundIcon } from "lucide-react";
import useSWR from "swr";
import Link from "next/link";
import { VerifiedIcon } from "@/assets/icons";
import { formatDate } from "@/utils/datetime";
import { useCopyToClipboard } from "@/hooks";

const columns = [
    { name: "ID", uid: "id" },
    { name: "NAME", uid: "name" },
    { name: "VERIFIED", uid: "verified" },
    { name: "BANNED", uid: "banned" },
    { name: "CREATED AT", uid: "created" },
    { name: "ACTIONS", uid: "actions" },
];

export default function AdminUserPage() {
    const { data, isLoading } = useSWR<{ data: IUser[] }>("/user");

    const users = (data?.data as IUser[]) || [];
    const copy = useCopyToClipboard();

    if (isLoading) {
        return (
            <div className="flex justify-center h-screen">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div>
            <Table aria-label="User table" removeWrapper className="overflow-auto">
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody>
                    {users?.map((user) => (
                        <TableRow key={user._id}>
                            <TableCell>
                                <Chip
                                    className="cursor-pointer"
                                    variant="flat"
                                    endContent={<CopyIcon color="#333" size={16} />}
                                    onClick={() => copy(user._id)}
                                >
                                    {user._id.length > 10 ? user._id.slice(0, 10) + "..." : user._id}
                                </Chip>
                            </TableCell>
                            <TableCell>
                                <User
                                    classNames={{
                                        description: "text-sm text-default-500",
                                    }}
                                    avatarProps={{
                                        radius: "full",
                                        isBordered: true,
                                        src: user?.photo || "",
                                    }}
                                    name={user?.username || "No name"}
                                    description={user?.email || "No email"}
                                />
                            </TableCell>

                            <TableCell>
                                <div className="flex items-center gap-x-2">
                                    {user.isVerified && (
                                        <Chip
                                            color="default"
                                            size="sm"
                                            variant="flat"
                                            startContent={<VerifiedIcon size={14} className="text-verify ms-1.5" />}
                                        >
                                            Verified
                                        </Chip>
                                    )}
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="flex items-center gap-x-2"></div>
                            </TableCell>

                            <TableCell>{formatDate(user?.createdAt)}</TableCell>
                            <TableCell>
                                <div className="relative flex justify-center items-center gap-x-4">
                                    <Tooltip content="View profile">
                                        <Link
                                            target="_blank"
                                            href={`/profile/${user._id}`}
                                            className="text-lg cursor-pointer active:opacity-50"
                                        >
                                            <UserRoundIcon size={16} />
                                        </Link>
                                    </Tooltip>

                                    <Tooltip color="danger" content="Ban">
                                        <Link href="" className="text-lg text-danger cursor-pointer active:opacity-50">
                                            <BanIcon size={16} />
                                        </Link>
                                    </Tooltip>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
