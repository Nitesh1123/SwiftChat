import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { fetchMessages, sendMessage } from "./message.controllers";

const router = Router();

router.post("/", authMiddleware, sendMessage);
router.get("/:conversationId", authMiddleware, fetchMessages);
export default router;
