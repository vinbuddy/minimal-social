import { io, Socket } from "socket.io-client";

import { ENV } from "@/config/env";
import { refreshTokens } from "./http";
import { getAccessToken } from "./token-storage";

let socket: Socket | null = null;

/**
 * One Socket.IO connection for the signed-in user. The server authenticates the handshake with `auth.token`
 * (the web uses the cookie) and puts the socket in the user's room once it emits `online`.
 */
export function connectSocket(): Socket {
    if (socket) {
        if (!socket.connected) socket.connect();
        return socket;
    }

    socket = io(ENV.API_BASE_URL, {
        transports: ["websocket"],
        // Read on every (re)connect, so a refreshed token is used
        auth: (cb) => {
            getAccessToken().then((token) => cb({ token }));
        },
    });

    // Rooms are per connection: join again after every reconnect
    socket.on("connect", () => socket?.emit("online"));

    socket.on("connect_error", async (error) => {
        if (error.message !== "Token expired") return;
        try {
            await refreshTokens();
            socket?.connect();
        } catch {
            // A rejected refresh signs the user out through the http client
        }
    });

    return socket;
}

export function disconnectSocket() {
    socket?.removeAllListeners();
    socket?.disconnect();
    socket = null;
}

export function getSocket() {
    return socket;
}
