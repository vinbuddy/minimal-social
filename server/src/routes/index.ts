import express from "express";

import authRoutes from "./auth.route";
import userRoutes from "./user.route";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);

export default router;
