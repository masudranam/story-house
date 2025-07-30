import { z } from 'zod';

export const searchCommentParamsSchema = z.object({
  content: z.string().optional(),
  author: z.string().optional(),
  storyId: z.string().uuid().optional(),
  page: z
    .string()
    .transform((val) => parseInt(val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'Page must be a positive number',
    })
    .optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'Limit must be a positive number',
    })
    .optional(),
});

export type searchCommentParams = z.infer<typeof searchCommentParamsSchema>;
