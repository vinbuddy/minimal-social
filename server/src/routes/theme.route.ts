import express, { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken";
import { getThemesHandler } from "../controllers/theme.controller";

const router: Router = express.Router();

router.get("/", verifyToken, getThemesHandler);
export default router;
