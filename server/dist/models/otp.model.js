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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTPModel = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
let OTP = class OTP {
};
__decorate([
    (0, typegoose_1.prop)({ required: false, default: "" }),
    __metadata("design:type", String)
], OTP.prototype, "username", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], OTP.prototype, "email", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: false, default: "" }),
    __metadata("design:type", String)
], OTP.prototype, "password", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], OTP.prototype, "otp", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: false, default: "register" }),
    __metadata("design:type", String)
], OTP.prototype, "type", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: Date.now, expires: (_a = process.env.OTP_EXPIRATION) !== null && _a !== void 0 ? _a : "5m" }),
    __metadata("design:type", Date)
], OTP.prototype, "createdAt", void 0);
OTP = __decorate([
    (0, typegoose_1.pre)("save", function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isModified("otp")) {
                return;
            }
            const salt = yield bcrypt_1.default.genSalt(10);
            const hashedPassword = yield bcrypt_1.default.hash(this.otp, salt);
            this.otp = hashedPassword;
            return;
        });
    }),
    (0, typegoose_1.modelOptions)({ schemaOptions: { collection: "otps", timestamps: true }, options: { allowMixed: typegoose_1.Severity.ALLOW } })
], OTP);
exports.OTPModel = (0, typegoose_1.getModelForClass)(OTP);
//# sourceMappingURL=otp.model.js.map