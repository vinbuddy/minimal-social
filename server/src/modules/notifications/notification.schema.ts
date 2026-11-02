import { z } from "zod";

export const createNotificationSchema = z.object({
    target: z.string().optional(),
    targetType: z.enum(["Comment", "Post", "Reel", "User"]),
    action: z.enum(["like", "comment", "follow", "mention", "repost"]),
    photo: z.string().optional(),
    message: z.string(),
    url: z.string().optional(),
    sender: z.string().optional(), // ignored — the sender is the authenticated user
    receivers: z.string().array(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;

export const pushTokenSchema = z.object({
    token: z.string().min(1),
    platform: z.enum(["ios", "android"]),
});

export const removePushTokenSchema = z.object({ token: z.string().min(1) });
