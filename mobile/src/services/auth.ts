import { isAxiosError } from "axios";

import i18n from "@/i18n";
import http from "@/lib/http";
import { AuthTokens } from "@/lib/token-storage";
import { IUser } from "@/types/user";

type AuthResponse = { data: IUser; tokens: AuthTokens };

export async function login(email: string, password: string) {
    const res = await http.post<AuthResponse>("/auth/login", { email, password });
    return res.data;
}

export async function loginWithGoogle(idToken: string) {
    const res = await http.post<AuthResponse>("/auth/google/mobile", { idToken });
    return res.data;
}

/** Sends a registration OTP to `email`; the account is created by verifyRegisterOTP */
export async function register(input: { username: string; email: string; password: string }) {
    await http.post("/auth/register", input);
}

export async function verifyRegisterOTP(email: string, otp: string) {
    await http.post("/auth/verify-otp", { email, otp });
}

export async function requestPasswordReset(email: string) {
    await http.post("/auth/forgot", { email });
}

export async function verifyPasswordResetOTP(email: string, otp: string) {
    await http.post("/auth/forgot/verify", { email, otp });
}

export async function resetPassword(input: { email: string; otp: string; password: string }) {
    await http.post("/auth/reset", input);
}

export async function getMe() {
    const res = await http.get<{ data: IUser | null }>("/auth/me");
    return res.data.data;
}

/** Revokes this device's session on the server. Tokens are passed in since the caller clears storage right after. */
export async function logout({ accessToken, refreshToken }: AuthTokens) {
    await http.post("/auth/logout", { refreshToken }, { headers: { Authorization: `Bearer ${accessToken}` } });
}

/** The server's message when there is one ("Invalid credentials"), else a translated transport error */
export function getErrorMessage(error: unknown): string {
    if (isAxiosError(error)) {
        const message = (error.response?.data as { message?: unknown } | undefined)?.message;
        if (typeof message === "string" && message) return message;
        if (!error.response) return i18n.t("auth:ERROR_NETWORK");
    }

    return i18n.t("auth:ERROR_GENERIC");
}
