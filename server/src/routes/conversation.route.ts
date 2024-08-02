import express, { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken";
import {
    createPrivateConversationHandler,
    getConversationsHandler,
    searchConversationsByNameHandler,
} from "../controllers/conversation.controller";

const router: Router = express.Router();

router.get("/", verifyToken, getConversationsHandler);
router.get("/search", searchConversationsByNameHandler);

router.post("/", createPrivateConversationHandler);

export default router;
