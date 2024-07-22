import { Avatar, Badge } from "@nextui-org/react";
import UserName from "./UserName";
import FollowButton from "./FollowButton";
import { HeartIcon, RepostIcon } from "@/assets/icons";

export default function UserItem() {
    return (
        <div className="flex items-center justify-between py-5 border-b border-divider last:border-none">
            <section className="flex items-center gap-4">
                <Badge
                    isOneChar
                    size="md"
                    content={<HeartIcon isFilled size={12} />}
                    color="danger"
                    placement="bottom-right"
                >
                    <Avatar
                        size="sm"
                        isBordered
                        src="https://scontent.cdninstagram.com/v/t51.2885-19/435256018_788186039888703_2696385283718779029_n.jpg?stp=dst-jpg_s320x320&_nc_ht=scontent.cdninstagram.com&_nc_cat=103&_nc_ohc=dGRb2yhxBX0Q7kNvgHYi_vC&edm=APs17CUBAAAA&ccb=7-5&oh=00_AYBxnM1mlc1pO_kz3aqLU-zJAiQByhxM3QubYozPQraJyg&oe=66A3B48E&_nc_sid=10d13b"
                    />
                </Badge>
                <h4>
                    <UserName />
                </h4>
            </section>
            <section>
                <FollowButton
                    user={{} as any}
                    onAfterFollowed={() => {}}
                    onAfterUnFollowed={() => {}}
                    buttonProps={{ size: "sm", radius: "md", fullWidth: false }}
                />
            </section>
        </div>
    );
}
