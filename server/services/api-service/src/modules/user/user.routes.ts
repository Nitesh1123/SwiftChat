import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import {searchUsers, setUserName} from "./user.controller";

const router = Router();

router.post("/set-username", authMiddleware, setUserName)
router.get("/search", authMiddleware, searchUsers);

export default router;