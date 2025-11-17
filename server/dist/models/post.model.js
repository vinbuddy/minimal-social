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
exports.Post = exports.MediaFile = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = require("./user.model");
class MediaFile {
}
exports.MediaFile = MediaFile;
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], MediaFile.prototype, "publicId", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], MediaFile.prototype, "url", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", Number)
], MediaFile.prototype, "width", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", Number)
], MediaFile.prototype, "height", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], MediaFile.prototype, "type", void 0);
let Post = class Post {
};
exports.Post = Post;
__decorate([
    (0, typegoose_1.prop)({ auto: true }),
    __metadata("design:type", mongoose_1.default.Types.ObjectId)
], Post.prototype, "_id", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: null }),
    __metadata("design:type", String)
], Post.prototype, "caption", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: [] }),
    __metadata("design:type", Array)
], Post.prototype, "mediaFiles", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: false }),
    __metadata("design:type", Boolean)
], Post.prototype, "isEdited", void 0);
__decorate([
    (0, typegoose_1.prop)({ ref: () => user_model_1.User }),
    __metadata("design:type", Object)
], Post.prototype, "postBy", void 0);
__decorate([
    (0, typegoose_1.prop)({ ref: () => user_model_1.User }),
    __metadata("design:type", Array)
], Post.prototype, "likes", void 0);
__decorate([
    (0, typegoose_1.prop)({ ref: () => user_model_1.User }),
    __metadata("design:type", Array)
], Post.prototype, "mentions", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", Array)
], Post.prototype, "tags", void 0);
__decorate([
    (0, typegoose_1.prop)({ ref: () => Post, default: null }),
    __metadata("design:type", Object)
], Post.prototype, "originalPost", void 0);
__decorate([
    (0, typegoose_1.prop)({ ref: () => user_model_1.User, default: [] }),
    __metadata("design:type", Array)
], Post.prototype, "reposts", void 0);
exports.Post = Post = __decorate([
    (0, typegoose_1.modelOptions)({ schemaOptions: { collection: "posts", timestamps: true }, options: { allowMixed: typegoose_1.Severity.ALLOW } })
], Post);
const PostModel = (0, typegoose_1.getModelForClass)(Post);
exports.default = PostModel;
//# sourceMappingURL=post.model.js.map