import express from "express";

import authRoutes from "./auth.route";
import userRoutes from "./user.route";
import postRoutes from "./post.route";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/post", postRoutes);

export default router;
