export interface SocketMessage {
  _id: string;
  conversationId: string;
  sender: string;
  content: string;
  type: "text" | "image" | "file";
  readBy: string[];
  createdAt: string;
  updatedAt: string;
}
