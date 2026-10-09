import { escapeRegex } from "../../shared/helpers/regex";
import { NextFunction, Request, Response } from "express";
import UserModel, { USER_MODEL_HIDDEN_FIELDS } from "../users/user.model";
import { searchPosts } from "../posts/post.service";
import { RequestWithUser } from "../../shared/types/request";

export async function autocompleteHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const query = req.query.query as string;

        if (!query) {
            return res.status(400).json({ error: 'Query parameter "query" is required' });
        }

        const users = await UserModel.find({ username: { $regex: escapeRegex(query), $options: "i" } })
            .select(USER_MODEL_HIDDEN_FIELDS)
            .limit(10);

        return res.status(200).json({ message: "Success", data: users });
    } catch (error) {
        next(error);
    }
}

export async function searchPostsHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
        const query = req.query.query as string;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 15;

        if (!query) {
            return res.status(400).json({ error: 'Query parameter "query" is required' });
        }

        const { posts, totalPosts, totalPages } = await searchPosts(req.user._id, query, page, limit);

        return res.status(200).json({ message: "Success", data: posts, totalPosts, totalPages, page, limit });
    } catch (error) {
        next(error);
    }
}
