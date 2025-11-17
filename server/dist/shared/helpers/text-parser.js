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
exports.replaceHrefs = exports.extractMentionsAndTags = void 0;
const user_model_1 = __importDefault(require("../../models/user.model"));
const extractMentionsAndTags = (html) => {
    const mentionRegex = /@(\w+)/g;
    const tagRegex = /#(\w+)/g;
    let mentions = [];
    let tags = [];
    let match;
    while ((match = mentionRegex.exec(html)) !== null) {
        mentions.push(match[1]); // Push captured username (without @) into mentions array
    }
    while ((match = tagRegex.exec(html)) !== null) {
        tags.push(match[1]); // Push captured tag (without #) into tags array
    }
    return { mentions, tags };
};
exports.extractMentionsAndTags = extractMentionsAndTags;
const replaceHrefs = (caption) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extract href - username
        const aTags = caption.match(/<a\s+href="\/profile\/([^"]+)"/g);
        const usernames = aTags === null || aTags === void 0 ? void 0 : aTags.map((tag) => { var _a; return (_a = tag.match(/\/profile\/([^"]+)/)) === null || _a === void 0 ? void 0 : _a[1]; });
        const userMap = {};
        if (usernames) {
            // Find userIds by usernames in database
            const users = yield user_model_1.default.find({ username: { $in: usernames } });
            users.forEach((user) => {
                userMap[user.username] = user._id;
            });
        }
        const updatedCaption = caption.replace(/<a\s+href="\/profile\/([^"]+)"/g, (match, username) => {
            const userId = userMap[username];
            return userId ? `<a href="/profile/${userId}"` : match;
        });
        return updatedCaption;
    }
    catch (error) {
        console.error(error);
    }
});
exports.replaceHrefs = replaceHrefs;
//# sourceMappingURL=text-parser.js.map