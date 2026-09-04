import type { MessageResponse } from "./message.types";

export interface ServerToClientEvents {
  "message:new": (message: MessageResponse) => void;
  "user:online": (data: { userId: string }) => void;
  "user:offline": (data: { userId: string; lastSeen: string }) => void;
}

export interface ClientToServerEvents {
  "conversation:join": (conversationId: string) => void;
  "conversation:leave": (conversationId: string) => void;
}