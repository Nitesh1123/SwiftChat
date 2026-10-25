import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import {getUserStats, searchUsers, setUserName} from "./user.controller";

const router = Router();

router.post("/set-username", authMiddleware, setUserName)
router.get("/search", authMiddleware, searchUsers);
router.get("/stats", authMiddleware, getUserStats);

export default router;
