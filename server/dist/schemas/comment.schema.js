"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCommentSchema = void 0;
const zod_1 = require("zod");
exports.createCommentSchema = zod_1.z.object({
    target: zod_1.z.string(),
    targetType: zod_1.z.string(),
    content: zod_1.z.string(),
    commentBy: zod_1.z.string(),
    rootComment: zod_1.z.string().optional(),
    replyTo: zod_1.z.string().optional(),
});
//# sourceMappingURL=comment.schema.js.map