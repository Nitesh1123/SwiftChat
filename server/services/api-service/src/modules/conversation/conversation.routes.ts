import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { createGrooupConversationController, getConversations, getOrCreateConversationController } from "./conversation.controller";

const router = Router();

router.get("/dm/:otherUserId", authMiddleware, getOrCreateConversationController);
router.post("/create-group", authMiddleware, createGrooupConversationController);
router.get("/", authMiddleware, getConversations);

export default router;