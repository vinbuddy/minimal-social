import { z } from "zod";

export const mediaFileSchema = z.object({
    publicId: z.string(),
    url: z.string().url(),
    width: z.number(),
    height: z.number(),
    type: z.enum(["image", "video"]),
});

export type MediaFileSchemaInput = z.infer<typeof mediaFileSchema>;
