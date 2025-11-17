"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAdminToken = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const verifyToken = (req, res, next) => {
    let accessToken = null;
    accessToken = req.cookies["accessToken"];
    if (!accessToken) {
        return res.status(403).json({ message: "No access token provided" });
    }
    try {
        const accessKey = process.env.JWT_ACCESS_KEY;
        jsonwebtoken_1.default.verify(accessToken, accessKey, (err, user) => {
            if ((err === null || err === void 0 ? void 0 : err.name) === "TokenExpiredError") {
                return res.status(401).json({ message: "Token expired" });
            }
            req.user = user;
            next();
        });
    }
    catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
exports.verifyToken = verifyToken;
const verifyAdminToken = (req, res, next) => {
    (0, exports.verifyToken)(req, res, () => {
        const user = req.user;
        if (!user)
            return res.status(403).json({ message: "Unauthorized" });
        if (user === null || user === void 0 ? void 0 : user.isAdmin) {
            next();
        }
        else {
            return res.status(403).json({ message: "You are not allowed" });
        }
    });
};
exports.verifyAdminToken = verifyAdminToken;
//# sourceMappingURL=verify-token.middleware.js.map