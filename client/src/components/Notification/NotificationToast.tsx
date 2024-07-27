import { INotification } from "@/types/notification";
import { IUser } from "@/types/user";
import Link from "next/link";
import NotificationThumbnail from "./NotificationThumbnail";

interface IProps {
    notification: INotification;
    sender: IUser;
}

export default function NotificationToast({ notification, sender }: IProps) {
    return (
        <Link href={notification?.url ?? "#"} className="flex items-center">
            <section>
                <NotificationThumbnail photo={notification?.photo} action={notification?.action} />
            </section>
            <section className="ms-4">
                <h4 className="font-semibold">
                    <span className="text-blue-500">{sender?.username}</span> {notification?.message}
                </h4>
            </section>
        </Link>
    );
}
