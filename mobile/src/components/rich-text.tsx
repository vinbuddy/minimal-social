import { router } from "expo-router";
import { useMemo } from "react";
import { Linking } from "react-native";

import { Text, TextProps } from "@/components/ui";
import { parseRichText } from "@/lib/rich-text";
import { useTheme } from "@/theme";

/** Mentions open the profile, hashtags open search, anything else opens in the browser */
export function openRichLink(href: string) {
    const profile = /^\/profile\/([^/?#]+)/.exec(href);
    if (profile) return router.push({ pathname: "/profile/[id]", params: { id: profile[1] } });

    const search = /^\/search\?query=([^&#]+)/.exec(href);
    if (search) return router.push({ pathname: "/search", params: { query: decodeURIComponent(search[1]) } });

    if (/^https?:\/\//.test(href)) Linking.openURL(href);
}

/** A caption or comment (stored as the web editor's HTML) as one block of text with tappable `link` spans */
export function RichText({ html, ...props }: Omit<TextProps, "children"> & { html: string }) {
    const { colors } = useTheme();
    const segments = useMemo(() => parseRichText(html), [html]);

    return (
        <Text {...props}>
            {segments.map((segment, index) =>
                segment.type === "link" ? (
                    <Text
                        key={index}
                        variant={props.variant}
                        weight={500}
                        accessibilityRole="link"
                        style={{ color: colors.link }}
                        onPress={() => openRichLink(segment.href)}
                    >
                        {segment.text}
                    </Text>
                ) : (
                    segment.text
                )
            )}
        </Text>
    );
}
