import { z } from "zod";

export const createReelSchema = z.object({
    publicId: z.string().min(1),
    caption: z.string().max(2200).default(""),
    audioId: z.string().optional(),
});

export const reelIdSchema = z.object({
    reelId: z.string().min(1),
});

export type CreateReelInput = z.infer<typeof createReelSchema>;
