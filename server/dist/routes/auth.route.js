"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_controller_1 = require("../controllers/auth.controller");
const verify_token_middleware_1 = require("../middlewares/verify-token.middleware");
dotenv_1.default.config();
const router = express_1.default.Router();
router.post("/register", auth_controller_1.registerHandler);
router.post("/login", auth_controller_1.loginHandler);
router.post("/verify-otp", auth_controller_1.verifyOTPHandler);
router.post("/refresh", auth_controller_1.refreshTokenHandler);
router.post("/logout", verify_token_middleware_1.verifyToken, auth_controller_1.logoutHandler);
router.post("/forgot", auth_controller_1.forgotPasswordHandler);
router.post("/forgot/verify", auth_controller_1.verifyForgotPasswordOTPHandler);
router.post("/reset", auth_controller_1.resetPasswordHandler);
router.get("/me", verify_token_middleware_1.verifyToken, auth_controller_1.getMeHandler);
router.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport_1.default.authenticate("google", { failureRedirect: process.env.CLIENT_BASE_URL, session: true }), auth_controller_1.googleAuthCallbackHandler);
exports.default = router;
//# sourceMappingURL=auth.route.js.map