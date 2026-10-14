import { NextFunction, Request, Response } from "express";
import { RequestWithUser } from "../../shared/types/request";
import { createPostSchema, editPostSchema } from "./post.schema";
import * as postService from "./post.service";

function getPagination(req: Request, defaultLimit = 15) {
    return {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || defaultLimit,
    };
}

export async function createPostHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
        // postBy in the body is ignored: the author is always the authenticated user
        const { caption } = createPostSchema.parse(req.body);

        const post = await postService.createPost(req.user._id, caption, req.files as Express.Multer.File[] | undefined);

        return res.status(200).json({ message: "Create post successfully", data: post });
    } catch (error) {
        next(error);
    }
}

export async function editPostHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
        const { caption, postId } = editPostSchema.parse(req.body);

        const post = await postService.editPost(req.user, postId, caption);

        return res.status(200).json({ message: "Edit post successfully", data: post });
    } catch (error) {
        next(error);
    }
}

export async function deletePostHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;

        await postService.deletePost(req.user, req.params.id);

        return res.status(200).json({ message: "Delete post successfully" });
    } catch (error) {
        next(error);
    }
}

export async function getAllPostsHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
        const { page, limit } = getPagination(req);

        const { posts, totalPosts, totalPages } = await postService.getFeed(req.user._id, page, limit);

        return res
            .status(200)
            .json({ message: "Get all posts successfully", data: posts, totalPosts, totalPages, page, limit });
    } catch (error) {
        next(error);
    }
}

export async function getFollowingPostsHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
        const { page, limit } = getPagination(req);

        const { posts, totalPosts, totalPages } = await postService.getFollowingPosts(req.user._id, page, limit);

        return res
            .status(200)
            .json({ message: "Get following posts successfully", data: posts, totalPosts, totalPages, page, limit });
    } catch (error) {
        next(error);
    }
}

export async function getPostDetailHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;

        const post = await postService.getPostDetail(req.user._id, req.params.id);

        return res.status(200).json({ message: "Get post detail successfully", data: post });
    } catch (error) {
        next(error);
    }
}

export async function getLikedPostsHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
        const { page, limit } = getPagination(req);

        const { posts, totalPosts, totalPages } = await postService.getLikedPosts(req.user._id, page, limit);

        return res
            .status(200)
            .json({ message: "Get liked posts successfully", data: posts, totalPosts, totalPages, page, limit });
    } catch (error) {
        next(error);
    }
}

export async function getUserPostsHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
        const userId = req.query.userId as string;
        const type = req.query.type === "repost" ? "repost" : "post";
        const { page, limit } = getPagination(req);

        const { posts, totalPosts, totalPages } = await postService.getUserPosts(req.user._id, userId, type, page, limit);

        return res
            .status(200)
            .json({ message: "Get user posts successfully", data: posts, totalPosts, totalPages, page, limit });
    } catch (error) {
        next(error);
    }
}

export async function likePostHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;

        const post = await postService.likePost(req.user._id, req.body.postId);

        return res.status(200).json({ message: "Post liked successfully", data: post });
    } catch (error) {
        next(error);
    }
}

export async function unlikePostHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;

        const post = await postService.unlikePost(req.user._id, req.body.postId);

        return res.status(200).json({ message: "Post unliked successfully", data: post });
    } catch (error) {
        next(error);
    }
}

export async function repostHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;

        const post = await postService.repost(req.user._id, req.body.postId);

        return res.status(200).json({ message: "Repost post successfully", data: post });
    } catch (error) {
        next(error);
    }
}

export async function unRepostHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;

        // Removes the viewer's repost; never deletes the post itself
        await postService.unrepost(req.user._id, req.body.originalPostId ?? req.body.postId);

        return res.status(200).json({ message: "Unrepost post successfully" });
    } catch (error) {
        next(error);
    }
}

// Post Activities
export async function getUsersLikedPostHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { page, limit } = getPagination(req, 5);

        const { users, totalUsers, totalPages } = await postService.getUsersLikedPost(req.params.id, page, limit);

        return res
            .status(200)
            .json({ message: "Get users liked post successfully", data: users, totalUsers, totalPages, page, limit });
    } catch (error) {
        next(error);
    }
}

export async function getUsersRepostedPostHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { page, limit } = getPagination(req, 5);

        const { users, totalUsers, totalPages } = await postService.getUsersRepostedPost(req.params.id, page, limit);

        return res
            .status(200)
            .json({ message: "Get users reposted post successfully", data: users, totalUsers, totalPages, page, limit });
    } catch (error) {
        next(error);
    }
}
