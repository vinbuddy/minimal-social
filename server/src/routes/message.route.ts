import express, { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken";
import {
    createMessageHandler,
    getConversationMessagesHandler,
    reactMessageHandler,
} from "../controllers/message.controller";
import multer from "multer";

const uploadFile = multer();
const router: Router = express.Router();

router.post("/", verifyToken, uploadFile.array("mediaFiles"), createMessageHandler);
router.get("/", verifyToken, getConversationMessagesHandler);

router.post("/reaction/:id", verifyToken, reactMessageHandler);

export default router;
