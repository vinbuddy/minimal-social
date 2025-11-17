"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = require("./user.model");
let Comment = class Comment {
};
exports.Comment = Comment;
__decorate([
    (0, typegoose_1.prop)({ auto: true }),
    __metadata("design:type", mongoose_1.default.Types.ObjectId)
], Comment.prototype, "_id", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true, enum: ["Post", "Video"] }),
    __metadata("design:type", String)
], Comment.prototype, "targetType", void 0);
__decorate([
    (0, typegoose_1.prop)({ refPath: "targetType", required: true }),
    __metadata("design:type", Object)
], Comment.prototype, "target", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: null }),
    __metadata("design:type", Object)
], Comment.prototype, "content", void 0);
__decorate([
    (0, typegoose_1.prop)({ ref: () => user_model_1.User, required: true }),
    __metadata("design:type", Object)
], Comment.prototype, "commentBy", void 0);
__decorate([
    (0, typegoose_1.prop)({ ref: () => Comment, default: null }),
    __metadata("design:type", Object)
], Comment.prototype, "rootComment", void 0);
__decorate([
    (0, typegoose_1.prop)({ ref: () => user_model_1.User, default: null }),
    __metadata("design:type", Object)
], Comment.prototype, "replyTo", void 0);
__decorate([
    (0, typegoose_1.prop)({ ref: () => user_model_1.User, default: [] }),
    __metadata("design:type", Array)
], Comment.prototype, "likes", void 0);
__decorate([
    (0, typegoose_1.prop)({ ref: () => user_model_1.User, default: [] }),
    __metadata("design:type", Array)
], Comment.prototype, "mentions", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: [] }),
    __metadata("design:type", Array)
], Comment.prototype, "tags", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: false }),
    __metadata("design:type", Boolean)
], Comment.prototype, "isEdited", void 0);
exports.Comment = Comment = __decorate([
    (0, typegoose_1.modelOptions)({ schemaOptions: { collection: "comments", timestamps: true }, options: { allowMixed: typegoose_1.Severity.ALLOW } })
], Comment);
const CommentModel = (0, typegoose_1.getModelForClass)(Comment);
exports.default = CommentModel;
//# sourceMappingURL=comment.model.js.map