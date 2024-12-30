import express from "express";

import authRoutes from "./auth.route";
import userRoutes from "./user.route";
import postRoutes from "./post.route";
import commentRoutes from "./comment.route";
import notificationRoutes from "./notification.route";
import searchRoutes from "./search.route";
import messageRoutes from "./message.route";
import conversationRoutes from "./conversation.route";
import stickerRoutes from "./sticker.route";
import themeRoutes from "./theme.route";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/post", postRoutes);
router.use("/comment", commentRoutes);
router.use("/notification", notificationRoutes);
router.use("/search", searchRoutes);
router.use("/message", messageRoutes);
router.use("/conversation", conversationRoutes);
router.use("/sticker", stickerRoutes);
router.use("/theme", themeRoutes);

export default router;
