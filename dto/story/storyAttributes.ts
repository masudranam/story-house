import { z } from 'zod';

export const storySchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  authorId: z.string().uuid().optional(),
  lastModificationTime: z.coerce.date().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type storyAttributes = z.infer<typeof storySchema>;
