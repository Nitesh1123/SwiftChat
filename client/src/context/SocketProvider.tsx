import { createContext, useEffect, type ReactNode } from 'react'
import { useUser } from './useUser';
import { socket } from '@/lib/socket';
import { type ServerToClientEvents, type ClientToServerEvents } from '@/types/socket';
import { Socket } from 'socket.io-client';

const SocketContext = createContext<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

const SocketProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useUser();

    useEffect(() => {
        if (!user) return;

        if (!socket.connected) {
            socket.connect();
            console.log(import.meta.env.VITE_SOCKET_URL)
        }

        return () => {
            socket.disconnect();
        };
    }, [user?.id]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider
