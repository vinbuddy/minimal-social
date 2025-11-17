"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = userSocketHandler;
const socket_service_1 = require("../services/socket.service");
const conversation_model_1 = __importDefault(require("../models/conversation.model"));
function userSocketHandler(socket) {
    socket.on("online", (data) => __awaiter(this, void 0, void 0, function* () {
        const userId = data === null || data === void 0 ? void 0 : data.userId;
        if (!userId)
            return;
        (0, socket_service_1.addSocketClient)(socket.id, userId);
        try {
            // Tìm các conversations mà user đã tham gia
            const conversations = yield conversation_model_1.default.find({
                participants: {
                    $in: [userId],
                },
            }).lean();
            if (conversations.length > 0) {
                conversations.forEach((conversation) => {
                    socket.join(conversation._id.toString());
                    console.log(`User ${userId} joined room ${conversation._id}`);
                });
                (0, socket_service_1.addOnlineUser)(userId, {
                    userId: userId,
                    socketId: socket.id,
                    roomIds: conversations.map((conversation) => conversation._id.toString()),
                    currentRoomId: null,
                });
            }
            else {
                console.log(`User ${userId} has no conversations`);
            }
        }
        catch (error) {
            console.error("Error fetching conversations:", error);
        }
        socket.emit("online", { message: "User online successfully" });
    }));
}
//# sourceMappingURL=user.socket.js.map