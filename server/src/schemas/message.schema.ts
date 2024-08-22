import { z } from "zod";

export const createMessageSchema = z.object({
    senderId: z.string(),
    conversationId: z.string().optional(),
    content: z.string().optional(),
    replyTo: z.string().optional(),
    stickerUrl: z.string().optional(),
    gifUrl: z.string().optional(),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
