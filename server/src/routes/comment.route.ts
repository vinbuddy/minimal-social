import express, { Router } from "express";
import {
    createCommentHandler,
    getCommentsByTargetHandler,
    getRepliesHandler,
    likeCommentHandler,
    unlikeCommentHandler,
} from "../controllers/comment.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router: Router = express.Router();

router.get("/", verifyToken, getCommentsByTargetHandler);
router.get("/reply", verifyToken, getRepliesHandler);
router.post("/", verifyToken, createCommentHandler);

router.put("/like", verifyToken, likeCommentHandler);
router.put("/unlike", verifyToken, unlikeCommentHandler);

export default router;
