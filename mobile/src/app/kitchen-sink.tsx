import { Image } from "expo-image";
import { LogOut, Pencil, Plus } from "lucide-react-native";
import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import {
    BirthdayHatIcon,
    CommentIcon,
    ConversationIcon,
    GoogleIcon,
    HeartIcon,
    HomeIcon,
    ImageIcon,
    ReelsIcon,
    RepostIcon,
    SearchIcon,
    StickerIcon,
    VerifiedIcon,
} from "@/components/icons";
import { Avatar, Badge, Button, Divider, Input, Logo, Screen, Skeleton, Text, toast, UserName } from "@/components/ui";
import { ENV } from "@/config/env";
import { changeLanguage, Language } from "@/i18n";
import { ColorTokens, radius, spacing, typography, TypographyVariant, useTheme } from "@/theme";

/** Every design-system primitive in one place, in both themes. A development screen, not a product one. */
export default function KitchenSinkScreen() {
    return (
        <Screen scroll contentStyle={{ paddingBottom: spacing[12] }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[3], padding: spacing[4] }}>
                <Logo size={40} />
                <View>
                    <Text variant="title">Kitchen sink</Text>
                    <Text variant="tiny" color="default500">
                        API: {ENV.API_BASE_URL}
                    </Text>
                </View>
            </View>

            <ThemeSection />
            <LanguageSection />
            <TypographySection />
            <ColorSection />
            <ButtonSection />
            <InputSection />
            <PeopleSection />
            <IconSection />
            <FeedRowSection />
            <SkeletonSection />
            <ToastSection />
        </Screen>
    );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <View>
            <Divider />
            <View style={{ padding: spacing[4], gap: spacing[3] }}>
                <Text variant="heading">{title}</Text>
                {children}
            </View>
        </View>
    );
}

function Row({ children }: { children: ReactNode }) {
    return <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spacing[2] }}>{children}</View>;
}

function ThemeSection() {
    const { preference, setPreference, theme } = useTheme();

    return (
        <Section title={`Theme (${theme})`}>
            <Row>
                {(["system", "light", "dark"] as const).map((option) => (
                    <Button key={option} size="sm" variant={preference === option ? "solid" : "bordered"} onPress={() => setPreference(option)}>
                        {option}
                    </Button>
                ))}
            </Row>
        </Section>
    );
}

const FLAGS: Record<Language, number> = {
    en: require("@/assets/images/flags/en.png"),
    vi: require("@/assets/images/flags/vn.png"),
};

function LanguageSection() {
    const { t, i18n } = useTranslation(["common", "post"]);

    return (
        <Section title="Language">
            <Row>
                {(["vi", "en"] as const).map((language) => (
                    <Button
                        key={language}
                        size="sm"
                        variant={i18n.language === language ? "solid" : "bordered"}
                        startContent={<Image source={FLAGS[language]} style={{ width: 18, height: 12, borderRadius: 2 }} />}
                        onPress={() => changeLanguage(language)}
                    >
                        {language.toUpperCase()}
                    </Button>
                ))}
            </Row>
            <Text variant="small" color="default500">
                {[t("LIKE"), t("COMMENT"), t("REPOST"), t("SEARCH"), t("LOGOUT")].join(" · ")}
            </Text>
        </Section>
    );
}

function TypographySection() {
    return (
        <Section title="Typography">
            {(Object.keys(typography) as TypographyVariant[]).map((variant) => (
                <View key={variant} style={{ flexDirection: "row", alignItems: "baseline", gap: spacing[3] }}>
                    <Text variant="tiny" color="default500" style={{ width: 64 }}>
                        {variant}
                    </Text>
                    <Text variant={variant} style={{ flex: 1 }} numberOfLines={1}>
                        {variant === "emoji" ? "👍" : "Just shipped dark mode"}
                    </Text>
                </View>
            ))}
        </Section>
    );
}

const SWATCHES: (keyof ColorTokens)[] = [
    "background",
    "foreground",
    "content1",
    "content2",
    "content3",
    "content4",
    "primary",
    "default",
    "default400",
    "default500",
    "default600",
    "danger",
    "success",
    "warning",
    "link",
    "verify",
];

function ColorSection() {
    const { colors } = useTheme();

    return (
        <Section title="Colour">
            <Row>
                {SWATCHES.map((name) => (
                    <View key={name} style={{ width: 72, gap: spacing[1] }}>
                        <View
                            style={{
                                height: 40,
                                borderRadius: radius.small,
                                backgroundColor: colors[name],
                                borderWidth: 1,
                                borderColor: colors.divider,
                            }}
                        />
                        <Text variant="tiny" color="default500" numberOfLines={1}>
                            {name}
                        </Text>
                    </View>
                ))}
            </Row>
        </Section>
    );
}

function ButtonSection() {
    const { colors } = useTheme();

    return (
        <Section title="Button">
            <Row>
                <Button>Follow</Button>
                <Button variant="bordered">Unfollow</Button>
                <Button variant="flat">Edit profile</Button>
                <Button variant="light">Cancel</Button>
            </Row>
            <Row>
                <Button color="danger" startContent={<LogOut size={16} color={colors.dangerForeground} />}>
                    Log out
                </Button>
                <Button color="danger" variant="light">
                    Delete
                </Button>
                <Button color="default">Default</Button>
            </Row>
            <Row>
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
            </Row>
            <Row>
                <Button isLoading>Saving</Button>
                <Button isDisabled>Disabled</Button>
                <Button isIconOnly radius="full" accessibilityLabel="Create post">
                    <Plus size={16} color={colors.primaryForeground} />
                </Button>
                <Button isIconOnly variant="light" accessibilityLabel="Edit">
                    <Pencil size={16} color={colors.foreground} />
                </Button>
            </Row>
            <Button fullWidth size="lg">
                Sign in
            </Button>
            <Button fullWidth size="lg" variant="bordered" startContent={<GoogleIcon size={20} />}>
                Sign in with Google
            </Button>
        </Section>
    );
}

function InputSection() {
    const [email, setEmail] = useState("");

    return (
        <Section title="Input">
            <Input label="Email" placeholder="Enter your email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            <Input label="Password" placeholder="Enter your password" isPassword />
            <Input label="Username" defaultValue="vin buddy" errorMessage="Username can't contain spaces" />
            <Input placeholder="Disabled" editable={false} />
        </Section>
    );
}

function PeopleSection() {
    return (
        <Section title="Avatar, UserName, Badge">
            <Row>
                <Avatar size="sm" name="vinbuddy" src="https://i.pravatar.cc/150?img=12" />
                <Avatar size="md" name="vinbuddy" src="https://i.pravatar.cc/150?img=12" />
                <Avatar size="lg" name="vinbuddy" src="https://i.pravatar.cc/150?img=12" isBordered />
                <Avatar size="xl" name="minh" />
                <Avatar size="md" name="broken" src="https://invalid.example.test/x.png" />
            </Row>
            <Row>
                <UserName username="vinbuddy" isVerified />
                <UserName username="a_really_long_username_that_should_truncate_nicely" />
                <UserName username={null} />
            </Row>
            <Row>
                <Badge count={3} />
                <Badge count={42} />
                <Badge count={120} />
            </Row>
        </Section>
    );
}

function IconSection() {
    const { colors } = useTheme();
    const [filled, setFilled] = useState(false);

    const pairs = [HomeIcon, SearchIcon, ConversationIcon, ReelsIcon, HeartIcon, CommentIcon];
    const singles = [RepostIcon, ImageIcon, StickerIcon];

    return (
        <Section title="Icons">
            <Pressable onPress={() => setFilled((value) => !value)} accessibilityRole="switch" accessibilityState={{ checked: filled }}>
                <Text variant="small" color="default500">
                    Tap to toggle outline / filled ({filled ? "filled" : "outline"})
                </Text>
            </Pressable>
            <Row>
                {pairs.map((Icon, index) => (
                    <Icon key={index} size={24} filled={filled} color={filled ? colors.foreground : colors.default400} />
                ))}
                {singles.map((Icon, index) => (
                    <Icon key={`s${index}`} size={24} />
                ))}
                <VerifiedIcon size={14} />
                <BirthdayHatIcon size={24} />
                <GoogleIcon size={24} />
            </Row>
        </Section>
    );
}

/** A feed row the way the web draws it: avatar gutter, divider, no card frame */
function FeedRowSection() {
    const { colors } = useTheme();
    const [liked, setLiked] = useState(false);
    const [reposted, setReposted] = useState(false);

    return (
        <Section title="Feed row">
            <View style={{ flexDirection: "row", paddingVertical: spacing[5] }}>
                <Avatar name="vinbuddy" src="https://i.pravatar.cc/150?img=12" />
                <View style={{ flex: 1, marginStart: spacing[4], gap: spacing[1] }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[2] }}>
                        <UserName username="vinbuddy" isVerified />
                        <Text variant="small" color="default500">
                            2h
                        </Text>
                    </View>
                    <Text>
                        Just shipped dark mode for chat. <Text style={{ color: colors.link }} weight={500}>minimal.social</Text>
                    </Text>
                    <View style={{ flexDirection: "row", gap: spacing[1], marginTop: spacing[2] }}>
                        <ActionPill onPress={() => setLiked((v) => !v)} label="24">
                            <HeartIcon size={18} filled={liked} color={liked ? colors.danger : colors.foreground} />
                        </ActionPill>
                        <ActionPill label="3">
                            <CommentIcon size={18} />
                        </ActionPill>
                        <ActionPill onPress={() => setReposted((v) => !v)} label="1">
                            <RepostIcon size={18} color={reposted ? colors.success : colors.foreground} />
                        </ActionPill>
                    </View>
                </View>
            </View>
            <Divider />
        </Section>
    );
}

function ActionPill({ children, label, onPress }: { children: ReactNode; label: string; onPress?: () => void }) {
    const { colors } = useTheme();

    return (
        <Pressable
            accessibilityRole="button"
            onPress={onPress}
            style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: spacing[1],
                paddingHorizontal: spacing[3],
                height: 32,
                borderRadius: radius.full,
                backgroundColor: pressed ? colors.content2 : "transparent",
            })}
        >
            {children}
            <Text variant="small" color="default600">
                {label}
            </Text>
        </Pressable>
    );
}

function SkeletonSection() {
    return (
        <Section title="Skeleton">
            <View style={{ flexDirection: "row", gap: spacing[4] }}>
                <Skeleton width={40} height={40} radius="full" />
                <View style={{ flex: 1, gap: spacing[2] }}>
                    <Skeleton width="40%" height={14} />
                    <Skeleton height={14} />
                    <Skeleton width="70%" height={14} />
                </View>
            </View>
        </Section>
    );
}

function ToastSection() {
    return (
        <Section title="Toast">
            <Row>
                <Button size="sm" variant="bordered" onPress={() => toast("Copied to clipboard")}>
                    Info
                </Button>
                <Button size="sm" variant="bordered" onPress={() => toast.success("Liked post successfully")}>
                    Success
                </Button>
                <Button size="sm" variant="bordered" color="danger" onPress={() => toast.error("Failed to repost")}>
                    Error
                </Button>
            </Row>
        </Section>
    );
}
