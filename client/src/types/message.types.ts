import type { ChatUser } from "./conversation.types";

export interface Message{
    _id: string,
    conversationId: string,
    sender: ChatUser,
    content: string,
    type: "text" | "image" | "file",
    readBy: string[],
    createdAt: string,
    updatedAt:string,
}

export interface MessageResponse{
    id: string,
    conversationId: string,
    sender: string,
    content: string,
    type: "text" | "image" | "file",
    readBy: string[],
    createdAt: string,
    updatedAt:string,
}