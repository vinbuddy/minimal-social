import express from "express";

import authRoutes from "./auth.route";
import userRoutes from "./user.route";
import postRoutes from "./post.route";
import commentRoutes from "./comment.route";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/post", postRoutes);
router.use("/comment", commentRoutes);

export default router;
