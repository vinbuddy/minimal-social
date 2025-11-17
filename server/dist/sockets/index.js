"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_socket_1 = __importDefault(require("./user.socket"));
const socket_service_1 = require("../services/socket.service");
const socketHandlers = (io) => {
    io.on("connection", (socket) => {
        console.log("Client connected ⚡: ", socket.id);
        // Handlers
        (0, user_socket_1.default)(socket);
        socket.on("disconnect", () => {
            (0, socket_service_1.removeSocketClient)(socket.id);
            console.log("user disconnected ❌: ", socket.id);
        });
    });
};
exports.default = socketHandlers;
//# sourceMappingURL=index.js.map