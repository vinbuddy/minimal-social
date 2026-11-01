import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";

import { ENV } from "@/config/env";

type GoogleSigninModule = typeof import("@react-native-google-signin/google-signin");

/**
 * Native Google Sign-In needs a development build: Expo Go doesn't ship the module, and the web preview
 * has no native SDK. The button is hidden where it can't work instead of crashing on import.
 */
export const isGoogleSignInAvailable =
    Platform.OS !== "web" &&
    Constants.executionEnvironment !== ExecutionEnvironment.StoreClient &&
    !!ENV.GOOGLE_WEB_CLIENT_ID;

let googleModule: GoogleSigninModule | null = null;

function getGoogleSignin(): GoogleSigninModule {
    if (!googleModule) {
        // Required lazily: importing it in Expo Go throws because the native module is missing
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        googleModule = require("@react-native-google-signin/google-signin") as GoogleSigninModule;
        googleModule.GoogleSignin.configure({
            // The ID token's audience is the web client, which the server already trusts
            webClientId: ENV.GOOGLE_WEB_CLIENT_ID,
            iosClientId: ENV.GOOGLE_IOS_CLIENT_ID,
        });
    }

    return googleModule;
}

/** Opens Google's sign-in sheet; resolves with an ID token, or null when the user cancels */
export async function signInWithGoogle(): Promise<string | null> {
    const { GoogleSignin, isSuccessResponse, isErrorWithCode, statusCodes } = getGoogleSignin();

    try {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const response = await GoogleSignin.signIn();
        if (!isSuccessResponse(response)) return null;

        return response.data.idToken ?? (await GoogleSignin.getTokens()).idToken;
    } catch (error) {
        if (isErrorWithCode(error) && (error.code === statusCodes.SIGN_IN_CANCELLED || error.code === statusCodes.IN_PROGRESS)) {
            return null;
        }
        throw error;
    }
}

/** Forget the Google account so the next sign-in shows the account picker again */
export async function signOutOfGoogle() {
    if (!isGoogleSignInAvailable || !googleModule) return;

    try {
        await googleModule.GoogleSignin.signOut();
    } catch {
        // Not signed in with Google: nothing to forget
    }
}
