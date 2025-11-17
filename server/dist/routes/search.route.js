"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const search_controller_1 = require("../controllers/search.controller");
const verify_token_middleware_1 = require("../middlewares/verify-token.middleware");
const router = express_1.default.Router();
router.get("/autocomplete", verify_token_middleware_1.verifyToken, search_controller_1.autocompleteHandler);
router.get("/post", verify_token_middleware_1.verifyToken, search_controller_1.searchPostsHandler);
exports.default = router;
//# sourceMappingURL=search.route.js.map