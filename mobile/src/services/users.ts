import { Platform } from "react-native";

import http from "@/lib/http";
import { IUser } from "@/types/user";

export const userUrl = (userId: string) => `/user/${userId}`;
export const followListUrl = (userId: string, type: "follower" | "following", search = "") =>
    `/user/${type}?userId=${userId}&search=${encodeURIComponent(search)}`;
export const suggestionsUrl = (userId: string) => `/user/suggestion?userId=${userId}`;
export const blockedUsersUrl = "/account/blocked";

/** Username search used by the mention picker */
export async function searchUsers(query: string) {
    const res = await http.get<{ data: IUser[] }>("/user/search", { params: { query } });
    return res.data.data;
}

/** Up to 10 usernames matching `query`, for the search screen */
export async function autocompleteUsers(query: string) {
    const res = await http.get<{ data: IUser[] }>("/search/autocomplete", { params: { query } });
    return res.data.data;
}

export async function getUser(userId: string) {
    const res = await http.get<{ data: IUser }>(userUrl(userId));
    return res.data.data;
}

export async function followUser(userId: string) {
    await http.put("/user/follow", { userId });
}

export async function unfollowUser(userId: string) {
    await http.put("/user/unfollow", { userId });
}

export type ProfilePhoto = { uri: string; name: string; mimeType: string };

/** Sends only what changed, as the web does; the server rejects an edit that changes nothing */
export async function editProfile(changes: { username?: string; bio?: string; photo?: ProfilePhoto }) {
    const form = new FormData();
    if (changes.username !== undefined) form.append("username", changes.username);
    if (changes.bio !== undefined) form.append("bio", changes.bio);
    if (changes.photo) {
        if (Platform.OS === "web") {
            form.append("file", await (await fetch(changes.photo.uri)).blob(), changes.photo.name);
        } else {
            form.append("file", { uri: changes.photo.uri, name: changes.photo.name, type: changes.photo.mimeType } as unknown as Blob);
        }
    }

    const res = await http.put<{ data: IUser }>("/user/edit", form, { headers: { "Content-Type": "multipart/form-data" } });
    return res.data.data;
}

export async function blockUser(userId: string) {
    await http.put(`/account/block/${userId}`);
}

export async function unblockUser(userId: string) {
    await http.put(`/account/unblock/${userId}`);
}

/** Step 1: checks the current password and emails an OTP; the new password is applied by the OTP */
export async function requestPasswordChange(password: string, newPassword: string) {
    await http.post("/account/change-password", { password, newPassword });
}

/** Step 2: every other device is signed out; this one gets fresh tokens */
export async function confirmPasswordChange(otp: string) {
    const res = await http.post<{ tokens?: { accessToken: string; refreshToken: string } }>("/account/change-password/verify", { otp });
    return res.data.tokens;
}
