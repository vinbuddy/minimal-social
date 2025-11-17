"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notification_controller_1 = require("../controllers/notification.controller");
const verify_token_middleware_1 = require("../middlewares/verify-token.middleware");
const router = express_1.default.Router();
router.post("/", verify_token_middleware_1.verifyToken, notification_controller_1.createNotificationHandler);
router.post("/read-all/:userId", verify_token_middleware_1.verifyToken, notification_controller_1.readAllNotificationsHandler);
router.get("/:userId", verify_token_middleware_1.verifyToken, notification_controller_1.getUserNotificationsHandler);
router.delete("/:id", verify_token_middleware_1.verifyToken, notification_controller_1.deleteNotificationHandler);
exports.default = router;
//# sourceMappingURL=notification.route.js.map