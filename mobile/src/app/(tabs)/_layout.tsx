import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { HeartIcon, HomeIcon, ReelsIcon, SearchIcon } from "@/components/icons";
import { Avatar } from "@/components/ui";
import useAuthStore from "@/stores/auth-store";
import { borderWidth, radius, useTheme } from "@/theme";

/**
 * The web's nav rail as a bottom bar: icon-only, outline when inactive (`default400`), filled when active (`foreground`).
 * Conversations open from the Home header, Instagram-style, to keep five tabs.
 */
export default function TabsLayout() {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const currentUser = useAuthStore((state) => state.currentUser);

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarActiveTintColor: colors.foreground,
                tabBarInactiveTintColor: colors.default400,
                tabBarStyle: {
                    backgroundColor: colors.background,
                    borderTopColor: colors.divider,
                    borderTopWidth: borderWidth.divider,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: t("HOME", { defaultValue: "Home" }),
                    tabBarIcon: ({ focused }) => <HomeIcon size={24} filled={focused} color={focused ? colors.foreground : colors.default400} />,
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    title: t("SEARCH"),
                    tabBarIcon: ({ focused }) => <SearchIcon size={24} filled={focused} color={focused ? colors.foreground : colors.default400} />,
                }}
            />
            <Tabs.Screen
                name="reels"
                options={{
                    title: "Reels",
                    tabBarIcon: ({ focused }) => <ReelsIcon size={24} filled={focused} color={focused ? colors.foreground : colors.default400} />,
                }}
            />
            <Tabs.Screen
                name="notifications"
                options={{
                    title: t("NOTIFICATIONS", { defaultValue: "Notifications" }),
                    tabBarIcon: ({ focused }) => <HeartIcon size={24} filled={focused} color={focused ? colors.foreground : colors.default400} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: t("PROFILE"),
                    tabBarIcon: ({ focused }) => (
                        <View
                            style={{
                                borderRadius: radius.full,
                                borderWidth: borderWidth.medium,
                                borderColor: focused ? colors.foreground : "transparent",
                            }}
                        >
                            <Avatar size="xs" src={currentUser?.photo} name={currentUser?.username} />
                        </View>
                    ),
                }}
            />
        </Tabs>
    );
}
