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
exports.Message = exports.MessageReaction = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const user_model_1 = require("./user.model");
const mongoose_1 = __importDefault(require("mongoose"));
const conversation_model_1 = require("./conversation.model");
class MessageReaction {
}
exports.MessageReaction = MessageReaction;
__decorate([
    (0, typegoose_1.prop)({ required: true, ref: () => user_model_1.User }),
    __metadata("design:type", Object)
], MessageReaction.prototype, "user", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], MessageReaction.prototype, "emoji", void 0);
let Message = class Message {
};
exports.Message = Message;
__decorate([
    (0, typegoose_1.prop)({ auto: true }),
    __metadata("design:type", mongoose_1.default.Types.ObjectId)
], Message.prototype, "_id", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true, ref: () => user_model_1.User }),
    __metadata("design:type", Object)
], Message.prototype, "sender", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true, ref: () => conversation_model_1.Conversation }),
    __metadata("design:type", Object)
], Message.prototype, "conversation", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: null }),
    __metadata("design:type", String)
], Message.prototype, "content", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: [] }),
    __metadata("design:type", Array)
], Message.prototype, "mediaFiles", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: null }),
    __metadata("design:type", Object)
], Message.prototype, "stickerUrl", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: null }),
    __metadata("design:type", Object)
], Message.prototype, "gifUrl", void 0);
__decorate([
    (0, typegoose_1.prop)({ ref: () => Message, default: null }),
    __metadata("design:type", Object)
], Message.prototype, "replyTo", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => [MessageReaction], default: [] }),
    __metadata("design:type", Array)
], Message.prototype, "reactions", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: false }),
    __metadata("design:type", Boolean)
], Message.prototype, "isEdited", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: false }),
    __metadata("design:type", Boolean)
], Message.prototype, "isRetracted", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: [], ref: () => user_model_1.User }),
    __metadata("design:type", Array)
], Message.prototype, "seenBy", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: [] }),
    __metadata("design:type", Array)
], Message.prototype, "excludedFor", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: Date.now }),
    __metadata("design:type", Date)
], Message.prototype, "createdAt", void 0);
exports.Message = Message = __decorate([
    (0, typegoose_1.modelOptions)({ schemaOptions: { collection: "messages", timestamps: true }, options: { allowMixed: typegoose_1.Severity.ALLOW } })
], Message);
const MessageModel = (0, typegoose_1.getModelForClass)(Message);
exports.default = MessageModel;
//# sourceMappingURL=message.model.js.map