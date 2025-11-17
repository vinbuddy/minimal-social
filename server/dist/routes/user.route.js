"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const verify_token_middleware_1 = require("../middlewares/verify-token.middleware");
const multer_1 = __importDefault(require("multer"));
const uploadFile = (0, multer_1.default)();
const router = express_1.default.Router();
router.get("/search", verify_token_middleware_1.verifyToken, user_controller_1.searchUserHandler);
router.get("/following", verify_token_middleware_1.verifyToken, user_controller_1.getFollowingsHandler);
router.get("/follower", verify_token_middleware_1.verifyToken, user_controller_1.getFollowersHandler);
router.get("/", verify_token_middleware_1.verifyAdminToken, user_controller_1.getUsersHandler);
router.get("/suggestion", user_controller_1.getFollowSuggestionsHandler);
// --
router.get("/:id", verify_token_middleware_1.verifyToken, user_controller_1.getUserHandler);
// --
router.put("/follow", verify_token_middleware_1.verifyToken, user_controller_1.followUserHandler);
router.put("/unfollow", verify_token_middleware_1.verifyToken, user_controller_1.unfollowUserHandler);
router.put("/edit", uploadFile.single("file"), verify_token_middleware_1.verifyToken, user_controller_1.editProfileHandler);
exports.default = router;
//# sourceMappingURL=user.route.js.map