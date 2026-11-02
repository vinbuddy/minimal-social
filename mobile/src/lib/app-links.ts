import { router } from "expo-router";
import { Linking } from "react-native";

/**
 * Opens a web-style path in the app: notification urls (`/post/:id?commentId=…`, `/reels/:id?commentId=…`, `/profile/:id`), caption links
 * (`/profile/:id`, `/search?query=tag`) and external URLs. Returns false for paths the app has no screen for yet.
 */
export function openAppUrl(url: string | null | undefined): boolean {
    if (!url) return false;

    if (/^https?:\/\//.test(url)) {
        Linking.openURL(url);
        return true;
    }

    const [path, query = ""] = url.split("?");
    const params = new URLSearchParams(query);

    const post = /^\/post\/([^/]+)/.exec(path);
    if (post) {
        router.push({ pathname: "/post/[id]", params: { id: post[1] } });
        return true;
    }

    const audio = /^\/reels\/audio\/([^/]+)/.exec(path);
    if (audio) {
        router.push({ pathname: "/reels/audio/[id]", params: { id: audio[1] } });
        return true;
    }

    const reel = /^\/reels\/([^/]+)/.exec(path);
    if (reel) {
        const commentId = params.get("commentId");
        const rootComment = params.get("rootComment");
        router.push({ pathname: "/reels/[id]", params: { id: reel[1], ...(commentId ? { commentId } : {}), ...(rootComment ? { rootComment } : {}) } });
        return true;
    }

    const profile = /^\/profile\/([^/]+)/.exec(path);
    if (profile) {
        router.push({ pathname: "/profile/[id]", params: { id: profile[1] } });
        return true;
    }

    if (path === "/search" && params.get("query")) {
        router.push({ pathname: "/search", params: { query: params.get("query") ?? "" } });
        return true;
    }

    return false;
}
