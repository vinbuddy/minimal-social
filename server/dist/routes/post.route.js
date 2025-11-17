"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const post_controller_1 = require("../controllers/post.controller");
const verify_token_middleware_1 = require("../middlewares/verify-token.middleware");
const multer_1 = __importDefault(require("multer"));
const uploadFile = (0, multer_1.default)();
const router = express_1.default.Router();
router.post("/", verify_token_middleware_1.verifyToken, uploadFile.array("mediaFiles"), post_controller_1.createPostHandler);
router.put("/", verify_token_middleware_1.verifyToken, post_controller_1.editPostHandler);
router.get("/", verify_token_middleware_1.verifyToken, post_controller_1.getAllPostsHandler);
router.get("/following", verify_token_middleware_1.verifyToken, post_controller_1.getFollowingPostsHandler);
router.get("/liked", verify_token_middleware_1.verifyToken, post_controller_1.getLikedPostsHandler);
router.get("/user-post", verify_token_middleware_1.verifyToken, post_controller_1.getUserPostsHandler);
router.post("/repost", verify_token_middleware_1.verifyToken, post_controller_1.repostHandler);
router.post("/un-repost", verify_token_middleware_1.verifyToken, post_controller_1.unRepostHandler);
router.get("/user-liked/:id", verify_token_middleware_1.verifyToken, post_controller_1.getUsersLikedPostHandler);
router.get("/user-reposted/:id", verify_token_middleware_1.verifyToken, post_controller_1.getUsersRepostedPostHandler);
router.get("/:id", post_controller_1.getPostDetailHandler);
router.delete("/:id", verify_token_middleware_1.verifyToken, post_controller_1.deletePostHandler);
router.post("/like", verify_token_middleware_1.verifyToken, post_controller_1.likePostHandler);
router.post("/unlike", verify_token_middleware_1.verifyToken, post_controller_1.unlikePostHandler);
exports.default = router;
//# sourceMappingURL=post.route.js.map