import { z } from "zod";

export const followUserSchema = z.object({
    userId: z.string(),
    currentUserId: z.string().optional(), // ignored — the follower is the authenticated user
});

export type FollowUserInput = z.infer<typeof followUserSchema>;
