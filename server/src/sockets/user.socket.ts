import { Server, Socket } from "socket.io";

export default function userSocketHandler(clients: Record<string, string>, io: Server, socket: Socket) {
    socket.on("online", (data) => {
        clients[socket.id] = data.userId;

        socket.emit("online", { message: "User online successfully" });
    });
}
