import express, { Router } from "express";
import {
    createPostHandler,
    editPostHandler,
    getAllPostsHandler,
    likePostHandler,
    unlikePostHandler,
} from "../controllers/post.controller";
import { verifyAdminToken, verifyToken } from "../middlewares/verifyToken";
import multer from "multer";
const uploadFile = multer();

const router: Router = express.Router();

router.post("/", verifyToken, uploadFile.array("mediaFiles"), createPostHandler);
router.put("/", verifyToken, editPostHandler);
router.get("/", verifyToken, getAllPostsHandler);
router.put("/like", verifyToken, likePostHandler);
router.put("/unlike", verifyToken, unlikePostHandler);

export default router;
