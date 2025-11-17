"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editPostSchema = exports.createPostSchema = void 0;
const zod_1 = require("zod");
exports.createPostSchema = zod_1.z.object({
    postBy: zod_1.z.string(),
    caption: zod_1.z.string(),
});
exports.editPostSchema = zod_1.z.object({
    caption: zod_1.z.string(),
    postId: zod_1.z.string(),
});
//# sourceMappingURL=post.schema.js.map