import { Server } from "socket.io";
import userSocketHandler from "./user.socket";

const clients: Record<string, string> = {
    // [socketId]: userId
};

const socketHandlers = (io: Server) => {
    io.on("connection", (socket) => {
        console.log("Client connected ⚡: ", socket.id);

        // Handlers
        userSocketHandler(clients, io, socket);

        socket.on("disconnect", () => {
            if (clients[socket.id]) {
                delete clients[socket.id];
            }
            console.log("user disconnected ❌: ", socket.id);
        });
    });
};

export default socketHandlers;
