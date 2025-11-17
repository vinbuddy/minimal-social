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
exports.Notification = exports.NotificationReceiver = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = require("./user.model");
class NotificationReceiver {
}
exports.NotificationReceiver = NotificationReceiver;
__decorate([
    (0, typegoose_1.prop)({ ref: () => user_model_1.User, required: true }),
    __metadata("design:type", Object)
], NotificationReceiver.prototype, "receiver", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: false }),
    __metadata("design:type", Boolean)
], NotificationReceiver.prototype, "isRead", void 0);
let Notification = class Notification {
};
exports.Notification = Notification;
__decorate([
    (0, typegoose_1.prop)({ auto: true }),
    __metadata("design:type", mongoose_1.default.Types.ObjectId)
], Notification.prototype, "_id", void 0);
__decorate([
    (0, typegoose_1.prop)({ refPath: "targetType", default: null }),
    __metadata("design:type", Object)
], Notification.prototype, "target", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], Notification.prototype, "targetType", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true, enum: ["like", "comment", "follow", "mention", "repost"] }),
    __metadata("design:type", String)
], Notification.prototype, "action", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], Notification.prototype, "photo", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], Notification.prototype, "message", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: null }),
    __metadata("design:type", Object)
], Notification.prototype, "url", void 0);
__decorate([
    (0, typegoose_1.prop)({ ref: () => user_model_1.User, required: true }),
    __metadata("design:type", Array)
], Notification.prototype, "senders", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", Array)
], Notification.prototype, "receivers", void 0);
exports.Notification = Notification = __decorate([
    (0, typegoose_1.modelOptions)({
        schemaOptions: { collection: "notifications", timestamps: true },
        options: { allowMixed: typegoose_1.Severity.ALLOW },
    })
], Notification);
const NotificationModel = (0, typegoose_1.getModelForClass)(Notification);
exports.default = NotificationModel;
//# sourceMappingURL=notification.model.js.map