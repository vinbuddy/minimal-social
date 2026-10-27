import express, { Router } from "express";
import {
    createReelHandler,
    deleteReelHandler,
    getAudioDetailHandler,
    getAudioReelsHandler,
    getReelDetailHandler,
    getReelFeedHandler,
    getSavedAudiosHandler,
    getUploadSignatureHandler,
    getUserReelsHandler,
    likeReelHandler,
    saveAudioHandler,
    unlikeReelHandler,
    unsaveAudioHandler,
    viewReelHandler,
} from "./reel.controller";
import { verifyToken } from "../../middlewares/verify-token.middleware";
import { reelUploadLimiter } from "../../middlewares/rate-limiter.middleware";

const router: Router = express.Router();

router.post("/upload-signature", verifyToken, reelUploadLimiter, getUploadSignatureHandler);
router.post("/", verifyToken, reelUploadLimiter, createReelHandler);
router.get("/feed", verifyToken, getReelFeedHandler);
router.get("/user/:userId", verifyToken, getUserReelsHandler);
router.post("/like", verifyToken, likeReelHandler);
router.post("/unlike", verifyToken, unlikeReelHandler);

router.get("/audio/saved", verifyToken, getSavedAudiosHandler);
router.get("/audio/:id", verifyToken, getAudioDetailHandler);
router.get("/audio/:id/reels", verifyToken, getAudioReelsHandler);
router.post("/audio/:id/save", verifyToken, saveAudioHandler);
router.delete("/audio/:id/save", verifyToken, unsaveAudioHandler);

router.get("/:id", verifyToken, getReelDetailHandler);
router.post("/:id/view", verifyToken, viewReelHandler);
router.delete("/:id", verifyToken, deleteReelHandler);

export default router;
