"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.followUserSchema = void 0;
const zod_1 = require("zod");
exports.followUserSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    currentUserId: zod_1.z.string(),
});
//# sourceMappingURL=user.schema.js.map