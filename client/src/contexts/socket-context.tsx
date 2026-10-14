"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { refreshAccessToken } from "@/utils/http-request";

import { useAuthStore } from "@/hooks/store";
import { ENV } from "@/config/env";

interface SocketContextType {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const { currentUser } = useAuthStore();

    useEffect(() => {
        if (!currentUser) return;

        const newSocket = io(ENV.API_BASE_URL as string, {
            withCredentials: true,
        });

        // Server identifies the user from the accessToken cookie; re-join rooms on every (re)connect
        newSocket.on("connect", () => {
            newSocket.emit("online");
        });

        newSocket.on("connect_error", async (error) => {
            if (error.message !== "Token expired") return;

            try {
                await refreshAccessToken();
                newSocket.connect();
            } catch {
                // Refresh failed — the HTTP interceptor / auth flow handles logging out
            }
        });

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
