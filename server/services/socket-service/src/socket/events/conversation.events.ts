import { Server, Socket } from "socket.io";

interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
  };
}
export const registerConversationEvents = (io: Server, socket: AuthenticatedSocket) => {
    socket.on("conversation:join", (conversationId: string) => {
        socket.join(`conversation:${conversationId}`);
        console.log(`User joined room: ${conversationId}`)
    })

    socket.on("conversation:leave", (conversationId: string) => {
        socket.leave(`conversation:${conversationId}`)
        console.log(`User left the conversation: ${conversationId}`)
    })
}