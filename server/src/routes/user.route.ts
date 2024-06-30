import express, { Router } from "express";
import { getUsersHandler } from "../controllers/user.controller";
import { verifyAdminToken, verifyToken } from "../middlewares/verifyToken";

const router: Router = express.Router();

router.get("/", verifyAdminToken, getUsersHandler);

export default router;
