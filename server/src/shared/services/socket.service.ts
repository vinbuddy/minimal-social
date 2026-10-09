import { Server } from "socket.io";

// Holds the Socket.IO server so modules outside the request cycle (e.g. queue workers)
// can emit without importing the app entry point (which would create an import cycle).
// Each user joins a room named by their userId; conversations use their conversationId.
let io: Server | null = null;

export function setSocketServer(server: Server) {
    io = server;
}

export function getSocketServer(): Server {
    if (!io) throw new Error("Socket.IO server has not been initialized");
    return io;
}
