import express, { Router } from "express";
import { getUserHandler, getUsersHandler, searchUserHandler } from "../controllers/user.controller";
import { verifyAdminToken, verifyToken } from "../middlewares/verifyToken";

const router: Router = express.Router();

router.get("/search", verifyToken, searchUserHandler);
router.get("/", verifyAdminToken, getUsersHandler);
router.get("/:id", verifyToken, getUserHandler);

export default router;
