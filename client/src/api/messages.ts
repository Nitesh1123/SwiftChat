import type { MessageResponse } from "@/types/message.types";
import api from "./api";

interface MessageResponseParams {
  conversationId?: string;
  before?: string;
  limit?: number;
}

interface MessageSendRequestParams{
    conversationId?:string;
    content: string
}

export const fetchMessages = async ({
  conversationId,
  before,
  limit = 20,
}: MessageResponseParams) : Promise<MessageResponse[]> => {
  const res = await api.get(`/messages/${conversationId}`, {
    params: {
      before,
      limit,
    },
  });
  return res.data.messages.messages;
};


export const sendMessage = async ({conversationId, content} : MessageSendRequestParams) : Promise<MessageResponse> => {
    const send = await api.post(`/messages`, {
        conversationId,
        content
    })
    return send.data.data;
}