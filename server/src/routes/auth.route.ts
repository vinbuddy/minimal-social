import express, { Router } from "express";
import { loginHandler, registerHandler } from "../controllers/auth.controller";

const router: Router = express.Router();

router.post("/register", registerHandler);
router.post("/login", loginHandler);

export default router;
