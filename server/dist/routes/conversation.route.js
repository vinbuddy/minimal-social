"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verify_token_middleware_1 = require("../middlewares/verify-token.middleware");
const conversation_controller_1 = require("../controllers/conversation.controller");
const router = express_1.default.Router();
router.get("/", verify_token_middleware_1.verifyToken, conversation_controller_1.getConversationsHandler);
router.get("/search", verify_token_middleware_1.verifyToken, conversation_controller_1.searchConversationsByNameHandler);
router.get("/storage/media-file", verify_token_middleware_1.verifyToken, conversation_controller_1.getConversationMediaFilesHandler);
router.get("/storage/link", verify_token_middleware_1.verifyToken, conversation_controller_1.getConversationLinksHandler);
router.get("/:id", verify_token_middleware_1.verifyToken, conversation_controller_1.getConversationDetailHandler);
router.post("/", verify_token_middleware_1.verifyToken, conversation_controller_1.createPrivateConversationHandler);
router.put("/change-emoji/:id", verify_token_middleware_1.verifyToken, conversation_controller_1.changeConversationEmojiHandler);
router.put("/change-theme/:id", verify_token_middleware_1.verifyToken, conversation_controller_1.changeThemeConversationHandler);
router.delete("/:id", verify_token_middleware_1.verifyToken, conversation_controller_1.deleteConversationHandler);
exports.default = router;
//# sourceMappingURL=conversation.route.js.map