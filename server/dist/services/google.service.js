"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeLoginWithGoogleService = initializeLoginWithGoogleService;
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const user_model_1 = __importDefault(require("../models/user.model"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function initializeLoginWithGoogleService() {
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
    }, (accessToken, refreshToken, profile, done) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const userFound = yield user_model_1.default.findOne({
                email: (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0].value,
            }).lean();
            // Login
            if (userFound && userFound.googleId === profile.id) {
                console.log("USER LOGIN WITH GOOGLE");
                return done(null, userFound);
            }
            // Login and update googleId
            if (userFound && !userFound.googleId) {
                const user = yield user_model_1.default.findByIdAndUpdate(userFound._id, {
                    googleId: profile.id,
                }, { new: true });
                console.log("USER LOGIN AND UPDATE GOOGLE ID");
                if (user)
                    return done(null, user);
            }
            // Login with existed googleId
            if (userFound) {
                return done(null, userFound);
            }
            // Register new user
            if (!userFound) {
                const user = yield user_model_1.default.create({
                    googleId: profile.id,
                    username: profile.displayName,
                    email: (_b = profile.emails) === null || _b === void 0 ? void 0 : _b[0].value,
                    photo: (_c = profile.photos) === null || _c === void 0 ? void 0 : _c[0].value,
                });
                console.log("USER REGISTER WITH GOOGLE");
                return done(null, user);
            }
        }
        catch (error) {
            return done(error);
        }
    })));
    passport_1.default.serializeUser((_user, done) => {
        const user = _user;
        done(null, user._id);
    });
    // Định nghĩa deserializeUser
    passport_1.default.deserializeUser((id, done) => __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield user_model_1.default.findById(id).lean();
            done(null, user);
        }
        catch (error) {
            done(error);
        }
    }));
}
//# sourceMappingURL=google.service.js.map