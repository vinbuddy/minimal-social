import { NextFunction, Request, Response } from "express";
import { RequestWithUser } from "../../shared/types/request";
import { createReelSchema, reelIdSchema } from "./reel.schema";
import * as reelService from "./reel.service";

function getPagination(req: Request, defaultLimit = 10) {
    return {
        page: Number(req.query.page) || 1,
        limit: Math.min(Number(req.query.limit) || defaultLimit, 30),
    };
}

export async function getUploadSignatureHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;

        const signature = reelService.createUploadSignature(req.user._id);

        return res.status(200).json({ message: "Create upload signature successfully", data: signature });
    } catch (error) {
        next(error);
    }
}

export async function createReelHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
        const input = createReelSchema.parse(req.body);

        const reel = await reelService.createReel(req.user._id, input);

        return res.status(200).json({ message: "Create reel successfully", data: reel });
    } catch (error) {
        next(error);
    }
}

export async function getReelFeedHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
        const { page, limit } = getPagination(req);
        const exclude = typeof req.query.exclude === "string" ? req.query.exclude.split(",") : [];

        const { reels, totalReels, totalPages } = await reelService.getFeed(req.user._id, page, limit, exclude);

        return res
            .status(200)
            .json({ message: "Get reels successfully", data: reels, totalReels, totalPages, page, limit });
    } catch (error) {
        next(error);
    }
}

export async function getReelDetailHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;

        const reel = await reelService.getReelDetail(req.user._id, req.params.id);

        return res.status(200).json({ message: "Get reel detail successfully", data: reel });
    } catch (error) {
        next(error);
    }
}

export async function getUserReelsHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
        const { page, limit } = getPagination(req, 12);

        const { reels, totalReels, totalPages } = await reelService.getUserReels(
            req.user._id,
            req.params.userId,
            page,
            limit
        );

        return res
            .status(200)
            .json({ message: "Get user reels successfully", data: reels, totalReels, totalPages, page, limit });
    } catch (error) {
        next(error);
    }
}

export async function deleteReelHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;

        await reelService.deleteReel(req.user, req.params.id);

        return res.status(200).json({ message: "Delete reel successfully" });
    } catch (error) {
        next(error);
    }
}

export async function likeReelHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
        const { reelId } = reelIdSchema.parse(req.body);

        const data = await reelService.likeReel(req.user._id, reelId);

        return res.status(200).json({ message: "Reel liked successfully", data });
    } catch (error) {
        next(error);
    }
}

export async function unlikeReelHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
        const { reelId } = reelIdSchema.parse(req.body);

        const data = await reelService.unlikeReel(req.user._id, reelId);

        return res.status(200).json({ message: "Reel unliked successfully", data });
    } catch (error) {
        next(error);
    }
}

export async function viewReelHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;

        await reelService.viewReel(req.user._id, req.params.id);

        return res.status(200).json({ message: "View reel successfully" });
    } catch (error) {
        next(error);
    }
}

// Audio
export async function getAudioDetailHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;

        const audio = await reelService.getAudioDetail(req.user._id, req.params.id);

        return res.status(200).json({ message: "Get audio detail successfully", data: audio });
    } catch (error) {
        next(error);
    }
}

export async function getAudioReelsHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
        const { page, limit } = getPagination(req, 12);

        const { reels, totalReels, totalPages } = await reelService.getAudioReels(
            req.user._id,
            req.params.id,
            page,
            limit
        );

        return res
            .status(200)
            .json({ message: "Get audio reels successfully", data: reels, totalReels, totalPages, page, limit });
    } catch (error) {
        next(error);
    }
}

export async function getSavedAudiosHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;
        const { page, limit } = getPagination(req, 20);

        const { audios, totalAudios, totalPages } = await reelService.getSavedAudios(req.user._id, page, limit);

        return res
            .status(200)
            .json({ message: "Get saved audios successfully", data: audios, totalAudios, totalPages, page, limit });
    } catch (error) {
        next(error);
    }
}

export async function saveAudioHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;

        await reelService.saveAudio(req.user._id, req.params.id);

        return res.status(200).json({ message: "Save audio successfully" });
    } catch (error) {
        next(error);
    }
}

export async function unsaveAudioHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithUser;

        await reelService.unsaveAudio(req.user._id, req.params.id);

        return res.status(200).json({ message: "Unsave audio successfully" });
    } catch (error) {
        next(error);
    }
}
