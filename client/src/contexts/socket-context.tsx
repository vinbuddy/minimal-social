"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

import { useAuthStore } from "@/hooks/store";

interface SocketContextType {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const { currentUser } = useAuthStore();

    useEffect(() => {
        if (!currentUser) return;

        const newSocket = io(process.env.NEXT_PUBLIC_API_BASE_URL as string, {
            withCredentials: true,
        });

        newSocket.emit("online", { userId: currentUser?._id });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [currentUser]);

    return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};

export const useSocketContext = (): SocketContextType => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
};
