import { useMemo } from "react";

import { Text, TextProps } from "@/components/ui";
import { openAppUrl } from "@/lib/app-links";
import { parseRichText } from "@/lib/rich-text";
import { useTheme } from "@/theme";

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
                        // Mentions open the profile, hashtags open search, anything else opens in the browser
                        onPress={() => openAppUrl(segment.href)}
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
