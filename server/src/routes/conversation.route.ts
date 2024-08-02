import express, { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken";
import {
    createPrivateConversationHandler,
    getConversationsHandler,
    searchConversationsByNameHandler,
} from "../controllers/conversation.controller";

const router: Router = express.Router();

router.get("/", verifyToken, getConversationsHandler);
router.get("/search", verifyToken, searchConversationsByNameHandler);

router.post("/", verifyToken, createPrivateConversationHandler);

export default router;
