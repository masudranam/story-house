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

export const storyBodySchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .refine((val) => val.trim().length > 0, {
      message: 'Title cannot be empty or only spaces',
    }),

  description: z
    .string()
    .min(1, 'Description is required')
    .refine((val) => val.trim().length > 0, {
      message: 'Description cannot be empty or only spaces',
    }),
});

export const storyUpdateSchema = z.object({
  title: z
    .string()
    .optional()
    .refine((val) => val === undefined || val.trim().length > 0, {
      message: 'Title cannot be empty or only spaces',
    }),

  description: z
    .string()
    .optional()
    .refine((val) => val === undefined || val.trim().length > 0, {
      message: 'Description cannot be empty or only spaces',
    }),
});

export type storyAttributes = z.infer<typeof storySchema>;
