"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const comment_controller_1 = require("../controllers/comment.controller");
const verify_token_middleware_1 = require("../middlewares/verify-token.middleware");
const router = express_1.default.Router();
router.get("/", comment_controller_1.getCommentsByTargetHandler);
router.get("/reply", comment_controller_1.getRepliesHandler);
router.post("/", verify_token_middleware_1.verifyToken, comment_controller_1.createCommentHandler);
router.delete("/:id", verify_token_middleware_1.verifyToken, comment_controller_1.deleteCommentHandler);
router.put("/like", verify_token_middleware_1.verifyToken, comment_controller_1.likeCommentHandler);
router.put("/unlike", verify_token_middleware_1.verifyToken, comment_controller_1.unlikeCommentHandler);
exports.default = router;
//# sourceMappingURL=comment.route.js.map