import { Pressable, View } from "react-native";

import { Avatar, Divider, Text, UserName } from "@/components/ui";
import { spacing, useTheme } from "@/theme";
import { IUser } from "@/types/user";

/** People matching the "@word" being typed; tapping one completes the mention */
export function MentionSuggestions({ users, onPick }: { users: IUser[]; onPick: (user: IUser) => void }) {
    const { colors } = useTheme();
    if (users.length === 0) return null;

    return (
        <View accessibilityRole="menu" style={{ backgroundColor: colors.content1 }}>
            {users.map((user, index) => (
                <View key={user._id}>
                    {index > 0 ? <Divider /> : null}
                    <Pressable
                        accessibilityRole="menuitem"
                        onPress={() => onPick(user)}
                        style={({ pressed }) => ({
                            flexDirection: "row",
                            alignItems: "center",
                            gap: spacing[3],
                            paddingHorizontal: spacing[4],
                            paddingVertical: spacing[2],
                            backgroundColor: pressed ? colors.content2 : "transparent",
                        })}
                    >
                        <Avatar size="sm" src={user.photo} name={user.username} />
                        <View style={{ flex: 1, gap: spacing[0.5] }}>
                            <UserName username={user.username} isVerified={user.isVerified} />
                            {user.bio ? (
                                <Text variant="tiny" color="default500" numberOfLines={1}>
                                    {user.bio}
                                </Text>
                            ) : null}
                        </View>
                    </Pressable>
                </View>
            ))}
        </View>
    );
}
