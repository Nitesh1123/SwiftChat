import type { Message } from "./message.types";

export interface ChatUser {
  _id: string;
  name: string;
  avatar: string;
}

export interface Conversation {
  _id: string;
  name?: string;
  type: "dm" | "group";
  participants: ChatUser[];
  lastMessage: Message | null;
  admins: ChatUser[];
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}
