import express, { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken";
import { getConversationsHandler } from "../controllers/conversation.controller";

const router: Router = express.Router();

router.get("/", verifyToken, getConversationsHandler);

export default router;
