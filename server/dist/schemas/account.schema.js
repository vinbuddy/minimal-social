"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = void 0;
const zod_1 = require("zod");
exports.changePasswordSchema = zod_1.z.object({
    password: zod_1.z.string({ required_error: "Old password is required" }),
    newPassword: zod_1.z
        .string({ required_error: "New password is required" })
        .min(6, "Password is too short - should be min 6 chars")
        .max(15),
});
//# sourceMappingURL=account.schema.js.map