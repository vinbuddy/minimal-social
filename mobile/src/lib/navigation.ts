import { router } from "expo-router";

/** Back to the previous screen; home when there is none (opened from a deep link or a web reload) */
export function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace("/");
}
