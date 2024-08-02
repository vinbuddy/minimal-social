import express, { Router } from "express";
import {
    editProfileHandler,
    followUserHandler,
    getFollowersHandler,
    getFollowingsHandler,
    getFollowSuggestionsHandler,
    getUserHandler,
    getUsersHandler,
    searchUserHandler,
    unfollowUserHandler,
} from "../controllers/user.controller";
import { verifyAdminToken, verifyToken } from "../middlewares/verifyToken";
import multer from "multer";

const uploadFile = multer();

const router: Router = express.Router();

router.put("/:id", uploadFile.single("file"), verifyToken, editProfileHandler);
router.get("/search", verifyToken, searchUserHandler);
router.get("/following", verifyToken, getFollowingsHandler);
router.get("/follower", verifyToken, getFollowersHandler);
router.get("/", verifyAdminToken, getUsersHandler);
router.get("/suggestion", getFollowSuggestionsHandler);
router.get("/:id", verifyToken, getUserHandler);

router.put("/follow", verifyToken, followUserHandler);
router.put("/unfollow", verifyToken, unfollowUserHandler);

export default router;
