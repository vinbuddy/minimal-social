import express, { Router } from "express";
import { getUsersHandler } from "../controllers/user.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router: Router = express.Router();

router.get("/", verifyToken, getUsersHandler);

export default router;
