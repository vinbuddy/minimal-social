"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessagesWithCursorQuerySchema = exports.getUsersReactedMessageQuerySchema = exports.getMessagesQuerySchema = exports.createMessageSchema = void 0;
const zod_1 = require("zod");
const base_schema_1 = require("./base.schema");
exports.createMessageSchema = zod_1.z.object({
    senderId: zod_1.z.string(),
    conversationId: zod_1.z.string().optional(),
    content: zod_1.z.string().optional(),
    replyTo: zod_1.z.string().optional(),
    stickerUrl: zod_1.z.string().optional(),
    gifUrl: zod_1.z.string().optional(),
});
// req.query
exports.getMessagesQuerySchema = base_schema_1.paginationQuerySchema.extend({
    conversationId: zod_1.z.string(),
});
exports.getUsersReactedMessageQuerySchema = zod_1.z.object({
    emoji: zod_1.z.string(),
    messageId: zod_1.z.string(),
});
exports.getMessagesWithCursorQuerySchema = base_schema_1.paginationQuerySchema.extend({
    messageId: zod_1.z.string().optional(),
    conversationId: zod_1.z.string(),
    direction: zod_1.z.enum(["next", "prev", "both", "init"]),
});
//# sourceMappingURL=message.schema.js.map