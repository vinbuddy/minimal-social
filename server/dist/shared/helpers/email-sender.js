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
exports.sendEmail = sendEmail;
const mailer_1 = __importDefault(require("../configs/mailer"));
function sendEmail(from, to, subject, content) {
    return __awaiter(this, void 0, void 0, function* () {
        // Code to send email
        try {
            const info = yield mailer_1.default.sendMail({
                from: {
                    name: "Minimal Social",
                    address: from,
                },
                to,
                subject,
                text: content,
            });
            return true;
        }
        catch (error) {
            console.log("error: ", error);
            return false;
        }
    });
}
//# sourceMappingURL=email-sender.js.map