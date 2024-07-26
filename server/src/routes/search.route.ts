import express, { Router } from "express";
import { autocompleteHandler, searchPostsHandler } from "../controllers/search.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router: Router = express.Router();

router.get("/autocomplete", verifyToken, autocompleteHandler);
router.get("/post", verifyToken, searchPostsHandler);

export default router;
