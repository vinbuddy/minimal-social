import { Tabs } from "expo-router";
import { ReactNode, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Animated, BackHandler, Easing, Pressable, useWindowDimensions, View } from "react-native";

import { HeartIcon, HomeIcon, ReelsIcon, SearchIcon } from "@/components/icons";
import { FeedDrawer } from "@/components/post/feed-drawer";
import { Avatar } from "@/components/ui";
import { useAnimatedValue } from "@/hooks/use-animated-value";
import useAuthStore from "@/stores/auth-store";
import { useFeedStore } from "@/stores/feed-store";
import { borderWidth, radius, useTheme } from "@/theme";

/**
 * The web's nav rail as a bottom bar: icon-only, outline when inactive (`default400`), filled when active (`foreground`).
 * Conversations open from the Home header, Instagram-style, to keep five tabs.
 */
export default function TabsLayout() {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const currentUser = useAuthStore((state) => state.currentUser);
    const hasUnread = !!currentUser?.isNotification;

    return (
        <DrawerContainer>
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
                        title: t("app:HOME"),
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
                        title: t("app:NOTIFICATIONS"),
                        tabBarIcon: ({ focused }) => (
                            <View>
                                <HeartIcon size={24} filled={focused} color={focused ? colors.foreground : colors.default400} />
                                {/* The API keeps one unread flag, not a count: a dot, like the web's rail */}
                                {hasUnread ? (
                                    <View
                                        accessibilityLabel={t("app:UNREAD_NOTIFICATIONS")}
                                        style={{
                                            position: "absolute",
                                            top: -1,
                                            right: -3,
                                            width: 8,
                                            height: 8,
                                            borderRadius: radius.full,
                                            backgroundColor: colors.danger,
                                        }}
                                    />
                                ) : null}
                            </View>
                        ),
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
        </DrawerContainer>
    );
}

/**
 * Threads' feed drawer: the whole tab UI (screens and tab bar) slides right with rounded corners to reveal the
 * feed list underneath; tapping the uncovered strip, or Android's back, closes it.
 */
function DrawerContainer({ children }: { children: ReactNode }) {
    const { colors, shadows } = useTheme();
    const { width: screenWidth } = useWindowDimensions();
    const isOpen = useFeedStore((state) => state.isDrawerOpen);
    const closeDrawer = useFeedStore((state) => state.closeDrawer);
    const progress = useAnimatedValue(0);
    const drawerWidth = Math.min(screenWidth * 0.8, 340);

    useEffect(() => {
        Animated.timing(progress, { toValue: isOpen ? 1 : 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    }, [isOpen, progress]);

    useEffect(() => {
        if (!isOpen) return;
        const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
            closeDrawer();
            return true;
        });
        return () => subscription.remove();
    }, [isOpen, closeDrawer]);

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={{ position: "absolute", top: 0, bottom: 0, left: 0 }} importantForAccessibility={isOpen ? "auto" : "no-hide-descendants"}>
                <FeedDrawer width={drawerWidth} />
            </View>

            <Animated.View
                style={{
                    flex: 1,
                    overflow: "hidden",
                    borderRadius: isOpen ? radius.large * 2 : 0,
                    boxShadow: isOpen ? shadows.large : undefined,
                    transform: [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, drawerWidth] }) }],
                }}
            >
                {children}
                {isOpen ? (
                    <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={closeDrawer} style={{ position: "absolute", inset: 0 }}>
                        <Animated.View style={{ flex: 1, backgroundColor: colors.overlay, opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] }) }} />
                    </Pressable>
                ) : null}
            </Animated.View>
        </View>
    );
}
