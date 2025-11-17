"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getThemesHandler = getThemesHandler;
const theme_model_1 = __importDefault(require("../models/theme.model"));
function getThemesHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const themes = yield theme_model_1.default.find();
            return res.status(200).json({ message: "Success", data: themes });
        }
        catch (error) {
            next(error);
        }
    });
}
//# sourceMappingURL=theme.controller.js.map