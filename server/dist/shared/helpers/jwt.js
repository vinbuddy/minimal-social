"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const generateToken = (user, type = "access") => {
    const key = type == "access" ? process.env.JWT_ACCESS_KEY : process.env.JWT_REFRESH_KEY;
    const accessToken = jsonwebtoken_1.default.sign({
        _id: user._id,
        isAdmin: user.isAdmin,
    }, key, {
        expiresIn: type == "access" ? process.env.JWT_ACCESS_EXPIRATION : process.env.JWT_REFRESH_EXPIRATION,
    });
    return accessToken;
};
exports.generateToken = generateToken;
//# sourceMappingURL=jwt.js.map