import { z } from 'zod';

export const commentSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  storyId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  commentId: z.string().uuid().optional(),
});

export const commentBodySchema = z.object({
  content: z.string().min(1, 'Description is required'),
});

export type commentAttributes = z.infer<typeof commentSchema>;
