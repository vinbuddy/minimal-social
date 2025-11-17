"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const verify_token_middleware_1 = require("../middlewares/verify-token.middleware");
const account_controller_1 = require("../controllers/account.controller");
dotenv_1.default.config();
const router = express_1.default.Router();
router.post("/change-password", verify_token_middleware_1.verifyToken, account_controller_1.changePasswordHandler);
router.post("/change-password/verify", verify_token_middleware_1.verifyToken, account_controller_1.verifyChangePasswordOTPHandler);
router.put("/block/:id", verify_token_middleware_1.verifyToken, account_controller_1.blockUserHandler);
router.put("/unblock/:id", verify_token_middleware_1.verifyToken, account_controller_1.unblockUserHandler);
router.get("/blocked", verify_token_middleware_1.verifyToken, account_controller_1.getBlockedUsersHandler);
exports.default = router;
//# sourceMappingURL=account.route.js.map