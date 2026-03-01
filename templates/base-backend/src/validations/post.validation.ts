import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be at most 200 characters").trim(),
  body: z.string().min(1, "Body is required").trim(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
