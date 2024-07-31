import { z } from "zod";
import { mediaFileSchema } from "./mediaFile.schema";
import { MessageReaction } from "../models/message.model";

export const createMessageSchema = z.object({
    sender: z.string(),
    receiver: z.string(),
    conversationId: z.string().optional(),
    content: z.string(),
    replyTo: z.string().optional(),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
