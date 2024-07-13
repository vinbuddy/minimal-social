import express, { Router } from "express";
import {
    followUserHandler,
    getUserHandler,
    getUsersHandler,
    searchUserHandler,
    unfollowUserHandler,
} from "../controllers/user.controller";
import { verifyAdminToken, verifyToken } from "../middlewares/verifyToken";

const router: Router = express.Router();

router.get("/search", verifyToken, searchUserHandler);
router.get("/", verifyAdminToken, getUsersHandler);
router.get("/:id", verifyToken, getUserHandler);

router.put("/follow", verifyToken, followUserHandler);
router.put("/unfollow", verifyToken, unfollowUserHandler);

export default router;
