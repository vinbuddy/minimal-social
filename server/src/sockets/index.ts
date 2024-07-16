import { Server } from "socket.io";

const socketHandlers = (io: Server) => {
    io.on("connection", (socket) => {
        console.log("Client connected ⚡: ", socket.id);

        // socket.on("example_event", (data) => {
        //     console.log("example_event received:", data);
        //     socket.emit("response_event", { message: "Hello from server" });
        // });

        // Send message to client
        socket.emit("message", "Hello from server");

        socket.on("disconnect", () => {
            console.log("user disconnected ❌: ", socket.id);
        });
    });
};

export default socketHandlers;
