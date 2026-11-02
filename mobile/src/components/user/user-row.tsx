import { router } from "expo-router";
import { ReactNode } from "react";
import { Pressable, View } from "react-native";

import { Avatar, Text, UserName } from "@/components/ui";
import { spacing, useTheme } from "@/theme";
import { IUser } from "@/types/user";
import { FollowButton } from "./follow-button";

type UserRowProps = {
    user: IUser;
    /** Replaces the Follow button (e.g. Unblock) */
    action?: ReactNode;
    /** Off where the API doesn't say whether you follow them (search results), as on the web */
    showFollow?: boolean;
};

/** A person in a list: avatar, name, bio, and a Follow button (or any `action`). Opens their profile */
export function UserRow({ user, action, showFollow = true }: UserRowProps) {
    const { colors } = useTheme();

    return (
        <Pressable
            onPress={() => router.push({ pathname: "/profile/[id]", params: { id: user._id } })}
            style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: spacing[3],
                paddingHorizontal: spacing[4],
                paddingVertical: spacing[3],
                backgroundColor: pressed ? colors.content2 : "transparent",
            })}
        >
            <Avatar src={user.photo} name={user.username} />
            <View style={{ flex: 1, gap: spacing[0.5] }}>
                <UserName username={user.username} isVerified={user.isVerified} />
                {user.bio ? (
                    <Text variant="small" color="default500" numberOfLines={1}>
                        {user.bio}
                    </Text>
                ) : null}
            </View>
            {action ?? (showFollow ? <FollowButton user={user} size="sm" /> : null)}
        </Pressable>
    );
}
