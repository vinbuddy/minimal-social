import { OAuth2Client, TokenPayload } from "google-auth-library";
import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import UserModel, { User } from "../users/user.model";

import envConfig from "../../shared/configs/env";
import logger from "../../shared/configs/logger";
import { BadRequestError, UnauthorizedError } from "../../shared/errors/app-error";

export function initializeLoginWithGoogleService() {
    if (!envConfig.GOOGLE_CLIENT_ID || !envConfig.GOOGLE_CLIENT_SECRET || !envConfig.GOOGLE_CALLBACK_URL) {
        logger.warn("Google OAuth is not configured — login with Google is disabled");
        return;
    }

    passport.use(
        new Strategy(
            {
                clientID: envConfig.GOOGLE_CLIENT_ID,
                clientSecret: envConfig.GOOGLE_CLIENT_SECRET,
                callbackURL: envConfig.GOOGLE_CALLBACK_URL,
            },
            async (_accessToken, _refreshToken, profile, done) => {
                try {
                    const user = await findOrCreateGoogleUser({
                        googleId: profile.id,
                        email: profile.emails?.[0].value,
                        username: profile.displayName,
                        photo: profile.photos?.[0].value,
                    });

                    return done(null, user);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );

    passport.serializeUser((_user, done) => {
        const user = _user as User;
        done(null, user._id);
    });

    // Định nghĩa deserializeUser
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await UserModel.findById(id).lean();
            done(null, user);
        } catch (error) {
            done(error);
        }
    });
}

type GoogleProfile = { googleId: string; email?: string; username: string; photo?: string };

/** Shared by the web (passport redirect) and mobile (ID token) Google sign-in */
export async function findOrCreateGoogleUser({ googleId, email, username, photo }: GoogleProfile) {
    const userFound = await UserModel.findOne({ email }).lean();

    // Login
    if (userFound && userFound.googleId === googleId) {
        logger.debug("User logged in with Google", { userId: userFound._id });
        return userFound;
    }

    // Login and update googleId
    if (userFound && !userFound.googleId) {
        const user = await UserModel.findByIdAndUpdate(userFound._id, { googleId }, { new: true }).lean();

        logger.debug("User logged in with Google and linked googleId", { userId: userFound._id });
        if (user) return user;
    }

    // Login with existed googleId
    if (userFound) {
        return userFound;
    }

    // Register new user
    const user = await UserModel.create({ googleId, username, email, photo });

    logger.debug("User registered with Google", { userId: user._id });

    return user.toObject();
}

let googleClient: OAuth2Client | null = null;

/** Verifies an ID token from the native Google Sign-In SDK and returns the profile it vouches for */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile> {
    const audience = [envConfig.GOOGLE_CLIENT_ID, ...(envConfig.GOOGLE_MOBILE_CLIENT_IDS ?? [])].filter(
        (id): id is string => !!id
    );

    if (audience.length === 0) {
        throw new BadRequestError("Login with Google is not configured");
    }

    googleClient ??= new OAuth2Client();

    let payload: TokenPayload | undefined;
    try {
        payload = (await googleClient.verifyIdToken({ idToken, audience })).getPayload();
    } catch {
        throw new UnauthorizedError("Invalid Google ID token");
    }

    if (!payload?.email || !payload.email_verified) {
        throw new UnauthorizedError("Google account has no verified email");
    }

    return {
        googleId: payload.sub,
        email: payload.email,
        username: payload.name ?? payload.email.split("@")[0],
        photo: payload.picture,
    };
}
