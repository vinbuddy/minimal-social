"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaFileSchema = void 0;
const zod_1 = require("zod");
exports.mediaFileSchema = zod_1.z.object({
    publicId: zod_1.z.string(),
    url: zod_1.z.string().url(),
    width: zod_1.z.number(),
    height: zod_1.z.number(),
    type: zod_1.z.enum(["image", "video"]),
});
//# sourceMappingURL=mediaFile.schema.js.map