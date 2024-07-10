import express, { Router } from "express";
import { createPost, getAllPosts } from "../controllers/post.controller";
import { verifyAdminToken, verifyToken } from "../middlewares/verifyToken";
import multer from "multer";
const uploadFile = multer();

const router: Router = express.Router();

router.post("/", verifyToken, uploadFile.array("mediaFiles"), createPost);
router.get("/", verifyToken, getAllPosts);

export default router;
