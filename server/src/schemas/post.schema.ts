import { z } from "zod";
import { mediaFileSchema } from "./mediaFile.schema";

export const createPostSchema = z.object({
    postBy: z.string(),
    caption: z.string(),
});

export type createPostInput = z.infer<typeof createPostSchema>;
