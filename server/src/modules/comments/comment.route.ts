import express, { Router } from "express";
import {
    createCommentHandler,
    deleteCommentHandler,
    getCommentByIdHandler,
    getCommentsByTargetHandler,
    getRepliesHandler,
    likeCommentHandler,
    unlikeCommentHandler,
} from "./comment.controller";
import { verifyToken } from "../../middlewares/verify-token.middleware";

const router: Router = express.Router();

router.get("/", verifyToken, getCommentsByTargetHandler);
router.get("/reply", verifyToken, getRepliesHandler);
router.get("/:id", verifyToken, getCommentByIdHandler);
router.post("/", verifyToken, createCommentHandler);
router.delete("/:id", verifyToken, deleteCommentHandler);

router.put("/like", verifyToken, likeCommentHandler);
router.put("/unlike", verifyToken, unlikeCommentHandler);

export default router;
