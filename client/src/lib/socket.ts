import type { ClientToServerEvents, ServerToClientEvents } from "@/types/socket"
import { io, Socket } from "socket.io-client"
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(import.meta.env.VITE_SOCKET_URL as string, {
    autoConnect: false,
    transports: ["websocket"],
    withCredentials: true,
})
