import { Server, Socket } from "socket.io";
import { SocketMessage } from "@zolo/types";
interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
  };
}
export const registerMessageEvents = (io: Server, socket: AuthenticatedSocket) => {
  socket.on('message:send', (data: SocketMessage) => {
    console.log(data);
    io.to(data.conversationId).emit('message:received', data)
  })
}