/**
 * Captions and comments are stored as the web editor's HTML: text, <br>, contenteditable <div>s and
 * `<a class="text-link">` mentions (/profile/:id) and hashtags (/search?query=tag). This turns that subset
 * into segments React Native can render, and builds the same HTML from the app's plain-text composer.
 */

export type RichSegment = { type: "text"; text: string } | { type: "link"; text: string; href: string };

const ENTITIES: Record<string, string> = { nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", "#39": "'" };

function decodeEntities(text: string) {
    return text.replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
        const lower = entity.toLowerCase();
        if (lower in ENTITIES) return ENTITIES[lower];
        if (lower.startsWith("#x")) return String.fromCodePoint(parseInt(lower.slice(2), 16));
        if (lower.startsWith("#")) return String.fromCodePoint(parseInt(lower.slice(1), 10));
        return match;
    });
}

const URL_PATTERN = /(https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"])/g;

/** Bare URLs in text become links, as the web's convertLinksToAnchors does */
function autolink(text: string): RichSegment[] {
    const segments: RichSegment[] = [];
    let last = 0;
    for (const match of text.matchAll(URL_PATTERN)) {
        const start = match.index ?? 0;
        if (start > last) segments.push({ type: "text", text: text.slice(last, start) });
        segments.push({ type: "link", text: match[0], href: match[0] });
        last = start + match[0].length;
    }
    if (last < text.length) segments.push({ type: "text", text: text.slice(last) });
    return segments;
}

export function parseRichText(html: string): RichSegment[] {
    const segments: RichSegment[] = [];
    const tagPattern = /<(\/?)([a-z0-9]+)([^>]*)>/gi;
    let last = 0;
    let openLink: { href: string; text: string } | null = null;

    const pushText = (raw: string) => {
        if (!raw) return;
        const text = decodeEntities(raw);
        if (openLink) openLink.text += text;
        else segments.push(...autolink(text));
    };
    const pushNewline = () => {
        // contenteditable wraps every line after the first in a <div>; never start with a blank line
        if (segments.length > 0 || openLink) pushText("\n");
    };

    for (const match of html.matchAll(tagPattern)) {
        pushText(html.slice(last, match.index));
        last = (match.index ?? 0) + match[0].length;

        const [, closing, rawName, attributes] = match;
        const name = rawName.toLowerCase();

        if (name === "br") pushNewline();
        else if ((name === "div" || name === "p") && !closing) pushNewline();
        else if (name === "a" && !closing) {
            const href = /href\s*=\s*"([^"]*)"/i.exec(attributes)?.[1] ?? /href\s*=\s*'([^']*)'/i.exec(attributes)?.[1];
            openLink = href ? { href: decodeEntities(href), text: "" } : null;
        } else if (name === "a" && closing && openLink) {
            segments.push({ type: "link", text: openLink.text, href: openLink.href });
            openLink = null;
        }
        // Any other tag (<span>, <b>…) is dropped, keeping its text
    }
    pushText(html.slice(last));
    if (openLink) segments.push({ type: "link", text: openLink.text, href: openLink.href });

    // Trim trailing blank lines left by empty <div><br></div> blocks
    while (segments.length > 0) {
        const tail = segments[segments.length - 1];
        if (tail.type !== "text" || tail.text.trim() !== "") break;
        segments.pop();
    }
    return segments;
}

/** Caption as plain text: for the edit composer, previews and "is it empty?" checks */
export function richTextToPlain(html: string): string {
    return parseRichText(html)
        .map((segment) => segment.text)
        .join("");
}

function escapeHtml(text: string) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * The web editor's markup from plain text. Mentions are linked only for usernames picked from suggestions
 * (the server rewrites `/profile/{username}` to the user's id); every #tag is linked.
 */
export function plainToRichText(text: string, mentionedUsernames: Set<string>): string {
    const linkWords = (chunk: string) =>
        chunk
            .replace(/(^|[^\w@])@(\w+)/g, (match, before: string, username: string) =>
                mentionedUsernames.has(username) ? `${before}<a href="/profile/${username}" class="text-link">@${username}</a>` : match
            )
            .replace(/(^|[^\w&#])#(\w+)/g, (_match, before: string, tag: string) => `${before}<a href="/search?query=${tag}" class="text-link">#${tag}</a>`);

    // URLs are left as they are (the reader autolinks them), so a "#fragment" or "@" inside one isn't linked
    return escapeHtml(text.trim())
        .split(/(https?:\/\/\S+)/g)
        .map((chunk, index) => (index % 2 === 1 ? chunk : linkWords(chunk)))
        .join("")
        .replace(/\n/g, "<br>");
}
