import { IMessage } from "@/types/chat";
import { richTextToPlain } from "./rich-text";

const EMOJI_ONLY = /^(?:\p{Extended_Pictographic}|\p{Emoji_Component}|‍|️|\s)+$/u;

/** A message that is only one to three emoji renders bubble-less at `emoji` size, as on the web */
export function isEmojiOnly(content: string | null) {
    if (!content) return false;
    const text = richTextToPlain(content).trim();
    return text.length > 0 && EMOJI_ONLY.test(text) && !/\d/.test(text) && [...text.replace(/\s/g, "")].length <= 6;
}

/** The web stores Giphy's embed page URL; the app shows the GIF itself */
export function gifImageUrl(gifUrl: string) {
    const id = /giphy\.com\/(?:embed|gifs)\/(?:[^/]*-)?([A-Za-z0-9]+)/.exec(gifUrl)?.[1];
    return id ? `https://media.giphy.com/media/${id}/giphy.gif` : gifUrl;
}

/** One line for a quote or a preview: text, or what kind of attachment it is */
export function messagePreview(
    message: Pick<IMessage, "content" | "mediaFiles" | "stickerUrl" | "gifUrl" | "isRetracted">,
    labels: { photo: string; sticker: string; gif: string; retracted: string },
) {
    if (message.isRetracted) return labels.retracted;
    if (message.content) return richTextToPlain(message.content).replace(/\s+/g, " ").trim();
    if (message.mediaFiles.length > 0) return labels.photo;
    if (message.stickerUrl) return labels.sticker;
    if (message.gifUrl) return labels.gif;
    return "";
}

/** Same sender within a minute: one group, like the web */
export const GROUP_GAP_MS = 60_000;

export function isSameDay(a: string, b: string) {
    return new Date(a).toDateString() === new Date(b).toDateString();
}
