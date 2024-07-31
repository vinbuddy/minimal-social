import express, { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken";
import { createMessageHandler } from "../controllers/message.controller";

const router: Router = express.Router();

router.post("/", verifyToken, createMessageHandler);

export default router;
