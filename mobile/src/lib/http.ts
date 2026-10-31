import axios, { AxiosError, InternalAxiosRequestConfig, isAxiosError } from "axios";

import { ENV } from "@/config/env";
import { AuthTokens, clearTokens, getAccessToken, getTokens, saveTokens } from "./token-storage";

/** Tells the server to send tokens in the body instead of httpOnly cookies */
const CLIENT_HEADERS = { "X-Client-Type": "mobile" };

const http = axios.create({
    baseURL: ENV.API_BASE_URL,
    headers: { "Content-Type": "application/json", Accept: "application/json", ...CLIENT_HEADERS },
});

http.interceptors.request.use(async (config) => {
    const accessToken = await getAccessToken();
    if (accessToken && !config.headers.Authorization) config.headers.Authorization = `Bearer ${accessToken}`;

    return config;
});

let onSessionExpired: (() => void) | null = null;

/** Called when the refresh token is rejected, so the app can send the user to sign in */
export function setSessionExpiredHandler(handler: (() => void) | null) {
    onSessionExpired = handler;
}

// Share one in-flight refresh between concurrent 401s: the server rotates the refresh
// token on each call, so parallel refreshes would invalidate each other
let refreshPromise: Promise<AuthTokens> | null = null;

export function refreshTokens(): Promise<AuthTokens> {
    refreshPromise ??= (async () => {
        const tokens = await getTokens();
        if (!tokens) throw new Error("No refresh token");

        // Plain axios: the interceptors below must not retry the refresh call itself
        const res = await axios.post<{ tokens: AuthTokens }>(
            `${ENV.API_BASE_URL}/auth/refresh`,
            { refreshToken: tokens.refreshToken },
            { headers: CLIENT_HEADERS }
        );
        await saveTokens(res.data.tokens);

        return res.data.tokens;
    })().finally(() => {
        refreshPromise = null;
    });

    return refreshPromise;
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

http.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as RetriableConfig | undefined;

        // Signed out (e.g. a rejected Google ID token on the sign-in screen): nothing to refresh, keep the server's error
        if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || !(await getTokens())) {
            return Promise.reject(error);
        }
        originalRequest._retry = true;

        try {
            const tokens = await refreshTokens();
            originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        } catch (refreshError) {
            // Only a rejected refresh token ends the session; a network error must not sign the user out
            const status = isAxiosError(refreshError) ? refreshError.response?.status : undefined;
            const isRejected = !isAxiosError(refreshError) || status === 401 || status === 403;

            if (isRejected) {
                await clearTokens();
                onSessionExpired?.();
            }
            return Promise.reject(refreshError);
        }

        return http(originalRequest);
    }
);

export function fetcher<T = unknown>(url: string): Promise<T> {
    return http.get<T>(url).then((res) => res.data);
}

export default http;
