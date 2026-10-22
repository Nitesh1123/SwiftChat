import api from "@/api/api"
import type { ClientToServerEvents, ServerToClientEvents } from "@/types/socket"
import { io, Socket } from "socket.io-client"

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(import.meta.env.VITE_SOCKET_URL as string, {
    autoConnect: false,
    transports: ["websocket"],
    withCredentials: true,
    // The auth cookie is scoped to the API host and never reaches the socket
    // host, so fetch a short-lived token for every (re)connect handshake.
    auth: (cb) => {
        api.get("/auth/socket-token")
            .then((res) => cb({ token: res.data.token }))
            .catch(() => cb({}))
    },
})
