import { Server, Socket } from "socket.io"
import { Server as HttpServer } from "http";
import { socketAuth } from "./auth";
import { registerConversationEvents } from "./events/conversation.events";
import { RedisService, pubClient, subClient, subscribe } from "@zolo/redis";
import { createAdapter } from "@socket.io/redis-adapter";
interface AuthenticatedSocket extends Socket {
    userId?: string;
}

let io: Server;
export const initSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true,
        }
    })

    io.adapter(createAdapter(pubClient, subClient));


    subscribe("socket:*", (message: any, channel: string) => {
        if (!message || !message.event) return;
        
        console.log(`[Socket Bus] Intercepted event on ${channel}, forwarding ${message.event} to room: ${message.room || 'all'}`);
        if (message.room) {
            io.to(message.room).emit(message.event, message.data);
        } else {
            io.emit(message.event, message.data);
        }
    });

    io.use(socketAuth);

    io.on("connection", async (socket: AuthenticatedSocket) => {
        console.log("User connected: ", socket.userId);
        if (!socket.userId) return;

        await RedisService.setUserOnline(socket.userId);
        await RedisService.addSocket(socket.userId, socket.id);
        socket.join(socket.userId);

        io.emit('user:online', {
            userId: socket.userId,
        })
        registerConversationEvents(io, socket);

        socket.on("disconnect", async () => {
            console.log("➡️ user disconnected: ", socket.userId);
            if (!socket.userId) return;
            await RedisService.removeSocket(socket.userId, socket.id);

            const connectedSockets = await io.in(socket.userId).fetchSockets();
            // const connectedSockets = await RedisService.getUserSockets(socket.userId);
            console.log(`User ${socket.userId} has ${connectedSockets.length} sockets still connected.`);

            if (connectedSockets.length === 0) {
                console.log(`Setting user ${socket.userId} to offline in Redis...`);
                await RedisService.setUserOffline(socket.userId);
                io.emit('user:offline', {
                    userId: socket.userId,
                    lastSeen: new Date(Date.now()).toISOString()
                })
            } else {
                console.log(`User ${socket.userId} still has other active tabs/sockets.`);
            }
        })
    })
}

export const getIo = () => {
    if (!io) throw new Error("Socket not initialised.");
    return io;
}