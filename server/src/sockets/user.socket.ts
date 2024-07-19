import { Server, Socket } from "socket.io";
import { addSocketClient, socketClients } from "../helpers/socket";

export default function userSocketHandler(socket: Socket) {
    socket.on("online", (data) => {
        addSocketClient(socket.id, data?.userId);
        console.log("User online", data?.userId);

        socket.emit("online", { message: "User online successfully" });
    });
}
