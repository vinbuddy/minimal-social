import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import envConfig from "../shared/configs/env";
import logger from "../shared/configs/logger";
import userSocketHandler from "./user.socket";

function getCookie(cookieHeader: string | undefined, name: string): string | undefined {
    if (!cookieHeader) return undefined;

    for (const part of cookieHeader.split(";")) {
        const [key, ...rest] = part.trim().split("=");
        if (key === name) return decodeURIComponent(rest.join("="));
    }

    return undefined;
}

const socketHandlers = (io: Server) => {
    // Authenticate every connection with the accessToken cookie.
    // The userId is taken from the verified token, never from client payloads.
    io.use((socket, next) => {
        const accessToken = getCookie(socket.handshake.headers.cookie, "accessToken");

        if (!accessToken) {
            return next(new Error("Unauthorized"));
        }

        try {
            const payload = jwt.verify(accessToken, envConfig.JWT_ACCESS_KEY) as { _id: string };
            socket.data.userId = String(payload._id);
            next();
        } catch (error: any) {
            next(new Error(error?.name === "TokenExpiredError" ? "Token expired" : "Unauthorized"));
        }
    });

    io.on("connection", (socket) => {
        logger.info(`Client connected ⚡: ${socket.id} (user ${socket.data.userId})`);

        // Handlers
        userSocketHandler(socket);

        socket.on("disconnect", () => {
            logger.info(`Client disconnected ❌: ${socket.id}`);
        });
    });
};

export default socketHandlers;
