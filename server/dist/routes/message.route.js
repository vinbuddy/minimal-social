"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verify_token_middleware_1 = require("../middlewares/verify-token.middleware");
const message_controller_1 = require("../controllers/message.controller");
const multer_1 = __importDefault(require("multer"));
const uploadFile = (0, multer_1.default)();
const router = express_1.default.Router();
router.post("/", verify_token_middleware_1.verifyToken, uploadFile.array("mediaFiles"), message_controller_1.createMessageHandler);
router.get("/", verify_token_middleware_1.verifyToken, message_controller_1.getConversationMessagesHandler);
router.get("/cursor-pagination", verify_token_middleware_1.verifyToken, message_controller_1.getMessagesWithCursorHandler);
router.get("/reaction", verify_token_middleware_1.verifyToken, message_controller_1.getUsersReactedMessageHandler);
router.post("/reaction/:id", verify_token_middleware_1.verifyToken, message_controller_1.reactMessageHandler);
router.post("/unreaction/:id", verify_token_middleware_1.verifyToken, message_controller_1.unreactMessageHandler);
router.delete("/delete/:id", verify_token_middleware_1.verifyToken, message_controller_1.deleteMessageHandler);
router.delete("/retract/:id", verify_token_middleware_1.verifyToken, message_controller_1.retractMessageHandler);
router.post("/mark-seen", verify_token_middleware_1.verifyToken, message_controller_1.markMessageAsSeenHandler);
router.get("/search", verify_token_middleware_1.verifyToken, message_controller_1.searchMessagesHandler);
exports.default = router;
//# sourceMappingURL=message.route.js.map