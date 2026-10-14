import { Socket } from "socket.io";
import logger from "../shared/configs/logger";
import ConversationModel from "../modules/messages/conversation.model";

export default function userSocketHandler(socket: Socket) {
    socket.on("online", async () => {
        // Set by the auth middleware in sockets/index.ts — any userId sent by the client is ignored
        const userId = socket.data.userId as string;
        if (!userId) return;

        // User joins their personal room for direct notifications
        socket.join(userId);

        try {
            // Join conversation rooms
            const conversations = await ConversationModel.find({
                participants: {
                    $in: [userId],
                },
            })
                .select("_id")
                .lean();

            conversations.forEach((conversation) => {
                socket.join(conversation._id.toString());
            });
        } catch (error) {
            logger.error("Error fetching conversations:", error);
        }

        socket.emit("online", { message: "User online successfully" });
    });
}
