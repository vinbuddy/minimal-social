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
exports.Conversation = exports.LastMessage = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const user_model_1 = require("./user.model");
const mongoose_1 = __importDefault(require("mongoose"));
const theme_model_1 = require("./theme.model");
class GroupInfo {
}
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], GroupInfo.prototype, "name", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: null }),
    __metadata("design:type", String)
], GroupInfo.prototype, "photo", void 0);
class LastMessage {
}
exports.LastMessage = LastMessage;
__decorate([
    (0, typegoose_1.prop)({ required: true, ref: () => user_model_1.User }),
    __metadata("design:type", Object)
], LastMessage.prototype, "sender", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], LastMessage.prototype, "content", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: Date.now }),
    __metadata("design:type", Date)
], LastMessage.prototype, "createdAt", void 0);
let Conversation = class Conversation {
};
exports.Conversation = Conversation;
__decorate([
    (0, typegoose_1.prop)({ auto: true }),
    __metadata("design:type", mongoose_1.default.Types.ObjectId)
], Conversation.prototype, "_id", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true, ref: () => user_model_1.User }),
    __metadata("design:type", Array)
], Conversation.prototype, "participants", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: false }),
    __metadata("design:type", Boolean)
], Conversation.prototype, "isGroup", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: null }),
    __metadata("design:type", GroupInfo)
], Conversation.prototype, "groupInfo", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: null }),
    __metadata("design:type", LastMessage)
], Conversation.prototype, "lastMessage", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: null, ref: () => theme_model_1.Theme }),
    __metadata("design:type", Object)
], Conversation.prototype, "theme", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: null }),
    __metadata("design:type", String)
], Conversation.prototype, "emoji", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: [], ref: () => user_model_1.User }),
    __metadata("design:type", Array)
], Conversation.prototype, "hiddenBy", void 0);
exports.Conversation = Conversation = __decorate([
    (0, typegoose_1.modelOptions)({
        schemaOptions: { collection: "conversations", timestamps: true },
        options: { allowMixed: typegoose_1.Severity.ALLOW },
    })
], Conversation);
const ConversationModel = (0, typegoose_1.getModelForClass)(Conversation);
exports.default = ConversationModel;
//# sourceMappingURL=conversation.model.js.map