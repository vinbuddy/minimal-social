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
exports.Theme = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const mongoose_1 = __importDefault(require("mongoose"));
let Theme = class Theme {
};
exports.Theme = Theme;
__decorate([
    (0, typegoose_1.prop)({ auto: true }),
    __metadata("design:type", mongoose_1.default.Types.ObjectId)
], Theme.prototype, "_id", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], Theme.prototype, "name", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], Theme.prototype, "color", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: null }),
    __metadata("design:type", String)
], Theme.prototype, "description", void 0);
exports.Theme = Theme = __decorate([
    (0, typegoose_1.modelOptions)({
        schemaOptions: { collection: "themes", timestamps: true },
        options: { allowMixed: typegoose_1.Severity.ALLOW },
    })
], Theme);
const ThemeModel = (0, typegoose_1.getModelForClass)(Theme);
exports.default = ThemeModel;
//# sourceMappingURL=theme.model.js.map