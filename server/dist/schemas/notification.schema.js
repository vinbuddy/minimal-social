"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotificationSchema = void 0;
const zod_1 = require("zod");
exports.createNotificationSchema = zod_1.z.object({
    target: zod_1.z.string().optional(),
    targetType: zod_1.z.enum(["Comment", "Post", "User"]),
    action: zod_1.z.enum(["like", "comment", "follow", "mention", "repost"]),
    photo: zod_1.z.string().optional(),
    message: zod_1.z.string(),
    url: zod_1.z.string().optional(),
    sender: zod_1.z.string(),
    receivers: zod_1.z.string().array(),
});
//# sourceMappingURL=notification.schema.js.map