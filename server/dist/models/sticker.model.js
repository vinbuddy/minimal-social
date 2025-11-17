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
exports.Sticker = exports.StickerItem = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const mongoose_1 = __importDefault(require("mongoose"));
class StickerItem {
}
exports.StickerItem = StickerItem;
__decorate([
    (0, typegoose_1.prop)({ auto: true }),
    __metadata("design:type", mongoose_1.default.Types.ObjectId)
], StickerItem.prototype, "publicId", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: [] }),
    __metadata("design:type", Array)
], StickerItem.prototype, "tags", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], StickerItem.prototype, "url", void 0);
let Sticker = class Sticker {
};
exports.Sticker = Sticker;
__decorate([
    (0, typegoose_1.prop)({ auto: true }),
    __metadata("design:type", mongoose_1.default.Types.ObjectId)
], Sticker.prototype, "_id", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], Sticker.prototype, "name", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: [] }),
    __metadata("design:type", Array)
], Sticker.prototype, "stickers", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], Sticker.prototype, "thumbnail", void 0);
exports.Sticker = Sticker = __decorate([
    (0, typegoose_1.modelOptions)({
        schemaOptions: { collection: "stickers", timestamps: true },
        options: { allowMixed: typegoose_1.Severity.ALLOW },
    })
], Sticker);
const StickerModel = (0, typegoose_1.getModelForClass)(Sticker);
exports.default = StickerModel;
//# sourceMappingURL=sticker.model.js.map