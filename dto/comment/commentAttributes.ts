import { z } from 'zod';

export const commentSchema = z.object({
  id: z.string().uuid().optional(),
  content: z.string().min(1, 'Content is required').optional(),
  storyId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  commentId: z.string().uuid().optional(),
});

export const commentBodySchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
});

export const commentParamsSchema = z.object({
  storyId: z.string().uuid({ message: 'Invalid post ID format' }),
});

export type commentAttributes = z.infer<typeof commentSchema>;
