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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordHandler = changePasswordHandler;
exports.verifyChangePasswordOTPHandler = verifyChangePasswordOTPHandler;
exports.blockUserHandler = blockUserHandler;
exports.unblockUserHandler = unblockUserHandler;
exports.getBlockedUsersHandler = getBlockedUsersHandler;
const bcrypt_1 = __importDefault(require("bcrypt"));
const otp_generator_1 = __importDefault(require("otp-generator"));
const auth_schema_1 = require("../schemas/auth.schema");
const user_model_1 = __importStar(require("../models/user.model"));
const otp_model_1 = require("../models/otp.model");
const email_sender_1 = require("../shared/helpers/email-sender");
const account_schema_1 = require("../schemas/account.schema");
const mongoose_1 = __importDefault(require("mongoose"));
function changePasswordHandler(_req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const req = _req;
            const { password, newPassword } = account_schema_1.changePasswordSchema.parse(req.body);
            const user = yield user_model_1.default.findById(req.user._id);
            if (!user) {
                return res.status(404).json({ statusCode: 404, message: "User not found" });
            }
            const isMatch = yield bcrypt_1.default.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ statusCode: 400, message: "Invalid password" });
            }
            // create otp
            const otpExists = yield otp_model_1.OTPModel.findOne({ email: user.email, type: "change" });
            if (otpExists) {
                yield otp_model_1.OTPModel.findOneAndDelete({ email: user.email, type: "change" });
            }
            // Send OTP to the user's email address
            const otp = otp_generator_1.default.generate(6, {
                digits: true,
                lowerCaseAlphabets: false,
                upperCaseAlphabets: false,
                specialChars: false,
            });
            yield (0, email_sender_1.sendEmail)(process.env.EMAIL_APP_USER, user.email, "OTP for changing password", `Your OTP is ${otp}. This OTP will expire in 5 minutes.`);
            // Create otp and save it to the database
            const otpModel = new otp_model_1.OTPModel({
                email: user.email,
                otp,
                type: "change",
                password: newPassword,
            });
            yield otpModel.save();
            return res.status(200).json({ message: "OTP sent to your email address", otp, toEmail: user.email });
        }
        catch (error) {
            next(error);
        }
    });
}
function verifyChangePasswordOTPHandler(_req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const req = _req;
            const user = req.user;
            const otpInput = auth_schema_1.otpSchema.parse(req.body);
            const { otp } = otpInput;
            const userExists = yield user_model_1.default.findById(user._id);
            if (!userExists) {
                return res.status(404).json({ message: "User not found" });
            }
            const otpData = yield otp_model_1.OTPModel.findOne({ email: userExists.email, type: "change" });
            if (!otpData) {
                return res.status(400).json({ message: "Invalid or expired OTP" });
            }
            const isMatch = yield bcrypt_1.default.compare(otp, otpData.otp);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid OTP" });
            }
            // Update password
            const salt = yield bcrypt_1.default.genSalt(10);
            const hashedPassword = yield bcrypt_1.default.hash(otpData.password, salt);
            yield user_model_1.default.findByIdAndUpdate(user._id, { password: hashedPassword });
            return res.status(200).json({ message: "OTP verified successfully" });
        }
        catch (error) {
            next(error);
        }
    });
}
// Block and unblock user
function blockUserHandler(_req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const req = _req;
            const blockedUserId = req.params.id;
            const userId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString();
            if (blockedUserId === userId) {
                return res.status(400).json({ message: "You cannot block yourself" });
            }
            const user = yield user_model_1.default.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            if (user.blockedUsers.includes(new mongoose_1.default.Types.ObjectId(blockedUserId))) {
                return res.status(400).json({ message: "User already blocked" });
            }
            user.blockedUsers.push(new mongoose_1.default.Types.ObjectId(blockedUserId));
            yield user.save();
            // Me: un-follow user blocked
            yield user_model_1.default.findByIdAndUpdate(userId, { $pull: { followings: blockedUserId } });
            yield user_model_1.default.findByIdAndUpdate(blockedUserId, { $pull: { followers: userId } });
            // Blocked user: un-follow me
            yield user_model_1.default.findByIdAndUpdate(blockedUserId, { $pull: { followings: userId } });
            yield user_model_1.default.findByIdAndUpdate(userId, { $pull: { followers: blockedUserId } });
            return res.status(200).json({ message: "User blocked successfully" });
        }
        catch (error) {
            next(error);
        }
    });
}
function unblockUserHandler(_req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const req = _req;
            const blockedUserId = req.params.id;
            const currentUserId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString();
            const currentUser = yield user_model_1.default.findById(currentUserId);
            if (!currentUserId) {
                return res.status(404).json({ message: "User not found" });
            }
            if (!(currentUser === null || currentUser === void 0 ? void 0 : currentUser.blockedUsers.includes(new mongoose_1.default.Types.ObjectId(blockedUserId)))) {
                return res.status(400).json({ message: "User not blocked" });
            }
            yield user_model_1.default.findByIdAndUpdate(currentUserId, { $pull: { blockedUsers: blockedUserId } });
            return res.status(200).json({ message: "User unblocked successfully" });
        }
        catch (error) {
            next(error);
        }
    });
}
function getBlockedUsersHandler(_req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        try {
            const req = _req;
            const page = (_a = Number(req.query.page)) !== null && _a !== void 0 ? _a : 1;
            const limit = (_b = Number(req.query.limit)) !== null && _b !== void 0 ? _b : 15;
            const userId = (_d = (_c = req.user) === null || _c === void 0 ? void 0 : _c._id) === null || _d === void 0 ? void 0 : _d.toString();
            const user = yield user_model_1.default.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            const skip = (Number(page) - 1) * limit;
            const totalUsers = yield user_model_1.default.countDocuments({ _id: { $in: user.blockedUsers } });
            const totalPages = Math.ceil(totalUsers / limit);
            const blockedUsers = yield user_model_1.default.find({ _id: { $in: user.blockedUsers } })
                .skip(skip)
                .limit(limit)
                .select(user_model_1.USER_MODEL_HIDDEN_FIELDS);
            return res.status(200).json({
                message: "Get blocked users successfully",
                data: blockedUsers,
                totalPages,
                totalUsers,
                page,
                limit,
            });
        }
        catch (error) {
            next(error);
        }
    });
}
//# sourceMappingURL=account.controller.js.map