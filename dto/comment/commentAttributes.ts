import { z } from 'zod';

export const commentSchema = z.object({
  id: z.string().uuid().optional(),
  content: z.string().min(1, 'Content is required').optional(),
  storyId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  commentId: z.string().uuid().optional(),
});

export type commentAttributes = z.infer<typeof commentSchema>;
