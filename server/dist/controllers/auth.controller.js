"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHandler = registerHandler;
exports.verifyOTPHandler = verifyOTPHandler;
exports.loginHandler = loginHandler;
exports.logoutHandler = logoutHandler;
exports.refreshTokenHandler = refreshTokenHandler;
exports.forgotPasswordHandler = forgotPasswordHandler;
exports.verifyForgotPasswordOTPHandler = verifyForgotPasswordOTPHandler;
exports.resetPasswordHandler = resetPasswordHandler;
exports.getMeHandler = getMeHandler;
exports.googleAuthCallbackHandler = googleAuthCallbackHandler;
const user_model_1 = __importStar(require("../models/user.model"));
const auth_schema_1 = require("../schemas/auth.schema");
const jwt_1 = require("../shared/helpers/jwt");
const bcrypt_1 = __importDefault(require("bcrypt"));
const email_sender_1 = require("../shared/helpers/email-sender");
const otp_generator_1 = __importDefault(require("otp-generator"));
const otp_model_1 = require("../models/otp.model");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cookieOptions = {
    httpOnly: true,
    secure: process.env.ENVIRONMENT === "production",
    path: "/",
    sameSite: process.env.ENVIRONMENT === "production" ? "none" : "strict",
};
function registerHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userInput = auth_schema_1.registerSchema.parse(req.body);
            const isExists = yield user_model_1.default.findOne({
                $or: [{ email: userInput.email }, { username: userInput.username }],
            });
            if (isExists) {
                return res.status(400).json({ message: "Email or username is already exists" });
            }
            // Check otp is already exists in the database
            const otpExists = yield otp_model_1.OTPModel.findOne({ email: userInput.email, type: "register" });
            if (otpExists) {
                yield otp_model_1.OTPModel.findOneAndDelete({ email: userInput.email, type: "register" });
            }
            // Send OTP to the user's email address
            const otp = otp_generator_1.default.generate(6, {
                digits: true,
                lowerCaseAlphabets: false,
                upperCaseAlphabets: false,
                specialChars: false,
            });
            yield (0, email_sender_1.sendEmail)(process.env.EMAIL_APP_USER, userInput.email, "OTP for Minimal Social", `Your OTP is ${otp}. This OTP will expire in 5 minutes.`);
            // Create otp and save it to the database
            const otpModel = new otp_model_1.OTPModel({
                username: userInput.email,
                password: userInput.password,
                email: userInput.email,
                otp,
                type: "register",
            });
            yield otpModel.save();
            return res.status(200).json({ message: "OTP sent to your email address", otp, toEmail: userInput.email });
        }
        catch (error) {
            next(error);
        }
    });
}
function verifyOTPHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const otpInput = auth_schema_1.otpSchema.parse(req.body);
            const { email, otp } = otpInput;
            const otpData = yield otp_model_1.OTPModel.findOne({ email });
            if (!otpData) {
                return res.status(400).json({ message: "Invalid or expired OTP" });
            }
            const isMatch = yield bcrypt_1.default.compare(otp, otpData.otp);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid OTP" });
            }
            const newUser = new user_model_1.default({ email: otpData.email, username: otpData.username, password: otpData.password });
            yield newUser.save();
            return res.status(200).json({ message: "User registered successfully", data: newUser });
        }
        catch (error) {
            next(error);
        }
    });
}
function loginHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email, password } = auth_schema_1.loginSchema.parse(req.body);
            const user = yield user_model_1.default.findOne({ email })
                .populate({
                path: "blockedUsers",
                select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
            })
                .lean(); // Find user by email address in the database
            if (!user) {
                return res.status(400).json({ statusCode: 400, message: "User not found" });
            }
            // Compare password with the hashed password in the database using bcrypt
            const isMatch = yield bcrypt_1.default.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ statusCode: 400, message: "Invalid credentials" });
            }
            const accessToken = (0, jwt_1.generateToken)(user, "access");
            const refreshToken = (0, jwt_1.generateToken)(user, "refresh");
            user.refreshToken = refreshToken;
            yield user_model_1.default.findByIdAndUpdate(user._id, { refreshToken });
            const { password: _password, refreshToken: _refreshToken } = user, userInfo = __rest(user, ["password", "refreshToken"]);
            return res
                .cookie("accessToken", accessToken, Object.assign(Object.assign({}, cookieOptions), { maxAge: 7 * 24 * 60 * 60 * 1000 }))
                .cookie("refreshToken", refreshToken, Object.assign(Object.assign({}, cookieOptions), { maxAge: 30 * 24 * 60 * 60 * 1000 }))
                .status(200)
                .json({ statusCode: 200, data: userInfo, accessToken, refreshToken });
        }
        catch (error) {
            next(error);
        }
    });
}
function logoutHandler(_req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const req = _req;
            if (!(req === null || req === void 0 ? void 0 : req.user)) {
                return res.status(401).json({ statusCode: 401, message: "You are not authorized" });
            }
            // Update refreshToken to null in the database
            yield user_model_1.default.findByIdAndUpdate(req.user._id, {
                $set: { refreshToken: null },
            }, { new: true });
            return res
                .clearCookie("accessToken", cookieOptions)
                .clearCookie("refreshToken", cookieOptions)
                .status(200)
                .json({ statusCode: 200, message: "Logged out successfully" });
        }
        catch (error) {
            next(error);
        }
    });
}
function refreshTokenHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO: Implement refresh token logic
        try {
            let refreshToken = null;
            refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(404).json({ statusCode: 401, message: "Refresh token not found" });
            }
            const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_KEY);
            const user = yield user_model_1.default.findById(decoded._id);
            if (!user) {
                return res.status(404).json({ statusCode: 404, message: "User not found" });
            }
            const newAccessToken = (0, jwt_1.generateToken)(user, "access");
            const newRefreshToken = (0, jwt_1.generateToken)(user, "refresh");
            user.refreshToken = newRefreshToken;
            yield user.save({ validateBeforeSave: false });
            return res
                .cookie("accessToken", newAccessToken, Object.assign(Object.assign({}, cookieOptions), { maxAge: 7 * 24 * 60 * 60 * 1000 }))
                .cookie("refreshToken", newRefreshToken, Object.assign(Object.assign({}, cookieOptions), { maxAge: 30 * 24 * 60 * 60 * 1000 }))
                .status(200)
                .json({ statusCode: 200, data: user, accessToken: newAccessToken, refreshToken: newRefreshToken });
        }
        catch (error) {
            console.log("error: ", error);
            next(error);
        }
    });
}
function forgotPasswordHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ statusCode: 400, message: "Email is required" });
            }
            const user = yield user_model_1.default.findOne({ email });
            if (!user) {
                return res.status(404).json({ statusCode: 404, message: "User not found" });
            }
            // Check otp is already exists in the database
            const otpExists = yield otp_model_1.OTPModel.findOne({ email, type: "forgot" });
            if (otpExists) {
                yield otp_model_1.OTPModel.findOneAndDelete({ email: email, type: "forgot" });
            }
            // Send OTP to the user's email address
            const otp = otp_generator_1.default.generate(6, {
                digits: true,
                lowerCaseAlphabets: false,
                upperCaseAlphabets: false,
                specialChars: false,
            });
            yield (0, email_sender_1.sendEmail)(process.env.EMAIL_APP_USER, email, "OTP for resetting password", `Your OTP is ${otp}. This OTP will expire in 5 minutes.`);
            // Create otp and save it to the database
            const otpModel = new otp_model_1.OTPModel({
                email: email,
                otp,
                type: "forgot",
            });
            yield otpModel.save();
            return res
                .status(200)
                .json({ statusCode: 200, message: "OTP sent to your email address", otp, toEmail: email });
        }
        catch (error) {
            next(error);
        }
    });
}
function verifyForgotPasswordOTPHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const otpInput = auth_schema_1.otpSchema.parse(req.body);
            const { email, otp } = otpInput;
            const otpData = yield otp_model_1.OTPModel.findOne({ email, type: "forgot" });
            if (!otpData) {
                return res.status(400).json({ message: "Invalid or expired OTP" });
            }
            const isMatch = yield bcrypt_1.default.compare(otp, otpData.otp);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid OTP" });
            }
            return res.status(200).json({ message: "User registered successfully" });
        }
        catch (error) {
            next(error);
        }
    });
}
function resetPasswordHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const otpInput = auth_schema_1.otpResetPasswordSchema.parse(req.body);
            const { email, password } = otpInput;
            const salt = yield bcrypt_1.default.genSalt(10);
            const hashedPassword = yield bcrypt_1.default.hash(password, salt);
            yield user_model_1.default.findOneAndUpdate({ email }, { password: hashedPassword });
            return res.status(200).json({ message: "Password reset successfully" });
        }
        catch (error) {
            next(error);
        }
    });
}
function getMeHandler(_req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const req = _req;
            const id = req.user._id;
            if (!id) {
                return res.status(400).json({ statusCode: 400, message: "Id is required" });
            }
            const user = yield user_model_1.default.findById(id)
                .populate({
                path: "blockedUsers",
                select: user_model_1.USER_MODEL_HIDDEN_FIELDS,
            })
                .select(user_model_1.USER_MODEL_HIDDEN_FIELDS);
            return res.status(200).json({ statusCode: 200, data: user });
        }
        catch (error) {
            next(error);
        }
    });
}
function googleAuthCallbackHandler(_req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const req = _req;
            const user = req.user;
            // Generate access token and refresh token
            const accessToken = (0, jwt_1.generateToken)(user, "access");
            const refreshToken = (0, jwt_1.generateToken)(user, "refresh");
            user.refreshToken = refreshToken;
            yield user_model_1.default.findByIdAndUpdate(user._id, { refreshToken });
            const { password: _password, refreshToken: _refreshToken } = user, userInfo = __rest(user, ["password", "refreshToken"]);
            req.logout((err) => {
                if (err) {
                    return next(err);
                }
                return res
                    .cookie("accessToken", accessToken, Object.assign(Object.assign({}, cookieOptions), { maxAge: 7 * 24 * 60 * 60 * 1000 }))
                    .cookie("refreshToken", refreshToken, Object.assign(Object.assign({}, cookieOptions), { maxAge: 30 * 24 * 60 * 60 * 1000 }))
                    .redirect(`${process.env.CLIENT_BASE_URL}/login`);
            });
        }
        catch (error) {
            console.log("error: ", error);
            next(error);
        }
    });
}
//# sourceMappingURL=auth.controller.js.map