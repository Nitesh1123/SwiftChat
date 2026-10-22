import type { Server, Socket } from "socket.io";
import { prisma } from "@swiftchat/prisma";

type Ack = (res: { ok: boolean; error?: string }) => void;

interface SendPayload {
  conversationId: string;
  content: string;
}

export function registerMessageEvents(io: Server, socket: Socket) {
  socket.on("message:send", async (payload: Partial<SendPayload>, ack?: Ack) => {
    try {
      const userId = socket.userId;
      if (!userId) {
        return ack?.({ ok: false, error: "UNAUTHENTICATED" });
      }
      const { conversationId, content } = payload ?? {};
      if (
        typeof conversationId !== "string" ||
        conversationId.length === 0 ||
        typeof content !== "string" ||
        content.trim().length === 0
      ) {
        return ack?.({ ok: false, error: "INVALID_PAYLOAD" });
      }
      const participant = await prisma.conversationParticipant.findFirst({
        where: { conversationId, userId },
        select: { userId: true },
      });
      if (!participant) {
        return ack?.({ ok: false, error: "FORBIDDEN" });
      }
      io.to(`conversation:${conversationId}`).emit("message:new", {
        conversationId,
        senderId: userId,
        content: content.trim(),
        sentAt: new Date().toISOString(),
      });
      ack?.({ ok: true });
    } catch (err) {
      console.error("message:send failed", err);
      ack?.({ ok: false, error: "INTERNAL_ERROR" });
    }
  });
}
