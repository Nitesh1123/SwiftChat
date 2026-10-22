import type { Server, Socket } from "socket.io";
import { prisma } from "../lib/prisma";

type Ack = (res: { ok: boolean; error?: string }) => void;

export function registerConversationEvents(io: Server, socket: Socket) {
  socket.on("conversation:join", async (conversationId: unknown, ack?: Ack) => {
    try {
      const userId = socket.userId;
      if (!userId) {
        return ack?.({ ok: false, error: "UNAUTHENTICATED" });
      }
      if (typeof conversationId !== "string" || conversationId.length === 0) {
        return ack?.({ ok: false, error: "INVALID_CONVERSATION_ID" });
      }
      const participant = await prisma.conversationParticipant.findFirst({
        where: { conversationId, userId },
        select: { userId: true },
      });
      if (!participant) {
        return ack?.({ ok: false, error: "FORBIDDEN" });
      }
      await socket.join(`conversation:${conversationId}`);
      ack?.({ ok: true });
    } catch (err) {
      console.error("conversation:join failed", err);
      ack?.({ ok: false, error: "INTERNAL_ERROR" });
    }
  });
}
