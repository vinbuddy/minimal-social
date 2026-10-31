import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import envConfig from "../shared/configs/env";
import logger from "../shared/configs/logger";
import { getBearerToken } from "../shared/helpers/request-auth";
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
    // Authenticate every connection with the access token: `auth.token` from mobile, the accessToken cookie from web.
    // The userId is taken from the verified token, never from client payloads.
    io.use((socket, next) => {
        const authToken = socket.handshake.auth?.token;
        const accessToken =
            (typeof authToken === "string" && authToken) ||
            getBearerToken(socket.handshake.headers.authorization) ||
            getCookie(socket.handshake.headers.cookie, "accessToken");

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
