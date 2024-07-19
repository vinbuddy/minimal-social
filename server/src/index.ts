import express, { Application } from "express";
import env from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import { createServer } from "node:http";
import { Server } from "socket.io";

import router from "./routes";
import socketHandlers from "./sockets";

env.config();

// Config server
const app: Application = express();
const httpServer = createServer(app);
const PORT: string | number = process.env.PORT || 5000;

const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_BASE__URL as string,
        credentials: true,
    },
});

// Use middlewares
app.set("io", io);

app.use(cookieParser());
app.use(cors({ credentials: true, origin: process.env.CLIENT_BASE__URL as string }));
app.options("*", cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.disable("etag");

// Routes
app.use(router);

app.use(errorHandler);

const startServer = async () => {
    const uri = process.env.MONGODB_URI as string;
    try {
        await mongoose.connect(uri);
        console.log(`Database connected`);

        // Set up Socket.io event handlers
        socketHandlers(io);

        httpServer.listen(PORT, () => {
            console.log(`running on https://localhost:${PORT}`);
        });
    } catch (error: any) {
        console.log("error: ", error.message);
        process.exit(1);
    }
};

startServer();
