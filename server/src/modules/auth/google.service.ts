import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import UserModel, { User } from "../users/user.model";

import envConfig from "../../shared/configs/env";
import logger from "../../shared/configs/logger";

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
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const userFound = await UserModel.findOne({
                        email: profile.emails?.[0].value,
                    }).lean();

                    // Login
                    if (userFound && userFound.googleId === profile.id) {
                        logger.debug("User logged in with Google", { userId: userFound._id });
                        return done(null, userFound);
                    }

                    // Login and update googleId
                    if (userFound && !userFound.googleId) {
                        const user = await UserModel.findByIdAndUpdate(
                            userFound._id,
                            {
                                googleId: profile.id,
                            },
                            { new: true }
                        );

                        logger.debug("User logged in with Google and linked googleId", { userId: userFound._id });
                        if (user) return done(null, user);
                    }

                    // Login with existed googleId
                    if (userFound) {
                        return done(null, userFound);
                    }

                    // Register new user
                    if (!userFound) {
                        const user = await UserModel.create({
                            googleId: profile.id,
                            username: profile.displayName,
                            email: profile.emails?.[0].value,
                            photo: profile.photos?.[0].value,
                        });

                        logger.debug("User registered with Google", { userId: user._id });

                        return done(null, user);
                    }
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
