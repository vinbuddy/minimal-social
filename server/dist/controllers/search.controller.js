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
exports.autocompleteHandler = autocompleteHandler;
exports.searchPostsHandler = searchPostsHandler;
const post_model_1 = __importDefault(require("../models/post.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const post_service_1 = require("../services/post.service");
function autocompleteHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const query = req.query.query;
            if (!query) {
                return res.status(400).json({ error: 'Query parameter "query" is required' });
            }
            const users = yield user_model_1.default.find({ username: { $regex: query, $options: "i" } }).limit(10);
            return res.status(200).json({ message: "Success", data: users });
        }
        catch (error) {
            next(error);
        }
    });
}
function searchPostsHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const query = req.query.query;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 15;
            if (!query) {
                return res.status(400).json({ error: 'Query parameter "query" is required' });
            }
            const skip = (Number(page) - 1) * limit;
            const totalPosts = yield post_model_1.default.countDocuments({ $text: { $search: query } });
            const totalPages = Math.ceil(totalPosts / limit);
            const posts = yield post_model_1.default.aggregate([
                { $match: { $text: { $search: query.trim() } } },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
                ...post_service_1.getPostQueryHelper.postLookups,
                ...post_service_1.getPostQueryHelper.originalPostLookups,
                {
                    $project: Object.assign(Object.assign({}, post_service_1.getPostQueryHelper.projectFields), { comment: 0 }),
                },
            ]);
            return res.status(200).json({ message: "Success", data: posts, totalPosts, totalPages, page, limit });
        }
        catch (error) {
            next(error);
        }
    });
}
//# sourceMappingURL=search.controller.js.map