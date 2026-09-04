import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/authMiddleware";
import { createGroup, createOrGetDM, getConversationsService } from "./conversation.service";

export const getOrCreateConversationController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    const { otherUserId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!otherUserId) {
      return res.status(400).json({ message: "otherUserId is required" });
    }

    if (userId === otherUserId) {
      return res
        .status(400)
        .json({ message: "Cannot create a DM with yourself" });
    }

    const conversation = await createOrGetDM(userId, otherUserId as string);

    return res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("DM controller error: ", error);
    next(error);
  }
};

export const createGrooupConversationController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const creatorId = req.userId;
    const { name, participants } = req.body;

    if (!creatorId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!name || !participants || !Array.isArray(participants)) {
      return res.status(400).json({
        success: false,
        message: "Group name and participants are required",
      });
    }

    if (participants.length < 2) {
      return res.status(400).json({
        success: false,
        message: "A group must have atleast 2 participants.",
      });
    }

    const conversation = await createGroup(name, participants, creatorId);
    return res.status(201).json({
      success: true,
      message: "Group created successfully",
      conversation,
    });
  } catch (error) {
    console.error("Create Group Error: ", error);
    next(error);
  }
};


export const getConversations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const conversations = await getConversationsService(req.userId!);
    res.status(200).json({ success: true, conversations });
  } catch (err: any) {
    next(err);
  }
};