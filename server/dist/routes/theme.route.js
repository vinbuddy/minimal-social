"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verify_token_middleware_1 = require("../middlewares/verify-token.middleware");
const theme_controller_1 = require("../controllers/theme.controller");
const router = express_1.default.Router();
router.get("/", verify_token_middleware_1.verifyToken, theme_controller_1.getThemesHandler);
exports.default = router;
//# sourceMappingURL=theme.route.js.map