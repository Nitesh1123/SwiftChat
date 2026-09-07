import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/authMiddleware";
import { fetchMessagesService, sendMessageService } from "./message.service";
import { sendMessage as publishToKafka } from "@swiftchat/kafka";
import { publishMessage } from "@swiftchat/redis";

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { conversationId, content, type } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!conversationId || !content) {
      return res.status(400).json({
        success: false,
        message: "conversationId, content, and userId are required",
      });
    }

    console.time("DB_Query_Time");
    const message = await sendMessageService({
      conversationId,
      senderId: userId,
      content,
      type,
    });
    console.timeEnd("DB_Query_Time");

    // Produce message to Kafka asynchronously (Fire-and-Forget)
    console.time("Kafka_Dispatch_Time");
    console.log("Publishing message to Kafka topic 'chat-messages'");
    publishToKafka("chat-messages", [{ value: JSON.stringify(message) }])
      .catch(err => console.error("Kafka Async Publish Error:", err));
    console.timeEnd("Kafka_Dispatch_Time");

    // Because Kafka consumer is currently bypassed, we directly publish to Redis so sockets receive it
    try {
      const pubPayload = {
        room: `conversation:${conversationId}`,
        event: "message:new",
        data: message
      };
      await publishMessage("socket:emit", pubPayload);
      console.log(`[API] Directly forwarded message to socket bus!`);
    } catch (err) {
      console.error("[API] Failed to publish message to Redis:", err);
    }

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("Send Message Error: ", error);
    next(error);
  }
};

export const fetchMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { conversationId } = req.params;
    const { limit, before } = req.query;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authorised",
      });
    }

    const messages = await fetchMessagesService({
      conversationId: conversationId as string,
      userId,
      limit: limit ? Number(limit) : undefined,
      before: before as string | undefined,
    });

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error: any) {
    next(error);
  }
};
