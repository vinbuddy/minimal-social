import express, { Router } from "express";
import { createCommentHandler, getAllCommentsHandler } from "../controllers/comment.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router: Router = express.Router();

router.get("/", verifyToken, getAllCommentsHandler);
router.post("/", verifyToken, createCommentHandler);

export default router;
