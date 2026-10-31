import { isAxiosError } from "axios";
import { create } from "zustand";

import { signOutOfGoogle } from "@/lib/google-sign-in";
import { setSessionExpiredHandler } from "@/lib/http";
import { AuthTokens, clearTokens, getTokens, saveTokens } from "@/lib/token-storage";
import * as authService from "@/services/auth";
import { IUser } from "@/types/user";

/**
 * - `loading`: reading stored tokens on launch
 * - `offline`: tokens exist but the server couldn't be reached, so we can't tell if they're still valid
 */
export type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "offline";

/** Kept in memory only: the OTP screens need them, and they must never go into a route param */
type PendingRegistration = { username: string; email: string; password: string };
type PendingPasswordReset = { email: string; otp?: string };

type AuthState = {
    status: AuthStatus;
    currentUser: IUser | null;
    pendingRegistration: PendingRegistration | null;
    pendingPasswordReset: PendingPasswordReset | null;

    /** Restore the session from SecureStore on launch */
    bootstrap: () => Promise<void>;
    signIn: (user: IUser, tokens: AuthTokens) => Promise<void>;
    signOut: () => Promise<void>;
    setCurrentUser: (user: IUser) => void;
    setPendingRegistration: (pending: PendingRegistration | null) => void;
    setPendingPasswordReset: (pending: PendingPasswordReset | null) => void;
};

const useAuthStore = create<AuthState>((set) => ({
    status: "loading",
    currentUser: null,
    pendingRegistration: null,
    pendingPasswordReset: null,

    // Doesn't go back to `loading`: a retry from the offline screen keeps that screen up instead of a blank one
    bootstrap: async () => {
        const tokens = await getTokens();
        if (!tokens) {
            set({ status: "unauthenticated", currentUser: null });
            return;
        }

        try {
            // A 401 here is refreshed by the http client; a rejected refresh clears the tokens
            const user = await authService.getMe();
            if (user) {
                set({ status: "authenticated", currentUser: user });
                return;
            }

            // Valid token for an account that no longer exists
            await clearTokens();
            set({ status: "unauthenticated", currentUser: null });
        } catch (error) {
            const reachedServer = isAxiosError(error) && !!error.response;
            set({ status: reachedServer ? "unauthenticated" : "offline", currentUser: null });
            if (reachedServer) await clearTokens();
        }
    },

    signIn: async (user, tokens) => {
        await saveTokens(tokens);
        set({ status: "authenticated", currentUser: user, pendingRegistration: null, pendingPasswordReset: null });
    },

    signOut: async () => {
        const tokens = await getTokens();
        if (tokens) {
            // Best effort: the local sign-out must not wait on, or fail with, the network
            authService.logout(tokens).catch(() => {});
        }

        await clearTokens();
        await signOutOfGoogle();
        set({ status: "unauthenticated", currentUser: null });
    },

    setCurrentUser: (user) => set({ currentUser: user }),
    setPendingRegistration: (pending) => set({ pendingRegistration: pending }),
    setPendingPasswordReset: (pending) => set({ pendingPasswordReset: pending }),
}));

// The refresh token was rejected mid-session: drop to the sign-in screen
setSessionExpiredHandler(() => {
    useAuthStore.setState({ status: "unauthenticated", currentUser: null });
});

export default useAuthStore;
